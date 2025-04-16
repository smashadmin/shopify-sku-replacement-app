const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const SkuMapping = require('../models/SkuMapping');
const ProcessingLog = require('../models/ProcessingLog');

// Helper function to verify Shopify webhook
const verifyShopifyWebhook = (req) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  if (!hmacHeader) return false;

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const body = req.rawBody || JSON.stringify(req.body);
  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(generatedHash),
    Buffer.from(hmacHeader)
  );
};

/**
 * Process order and replace SKUs if needed, based on per-mapping tags.
 */
const processOrder = async (order) => {
  // Parse order tags into an array of trimmed, lowercase tags
  const orderTags = (order.tags || "")
    .split(",")
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);

  // Get all active SKU mappings
  const skuMappings = await SkuMapping.find({ active: true });

  const replacements = [];
  const lineItemsToUpdate = [];

  // Check each line item for SKUs that need replacement
  if (order.line_items && order.line_items.length > 0) {
    for (const item of order.line_items) {
      if (!item.sku) continue;

      // Find all mappings for this SKU where the order contains at least one of the mapping's tags
      const applicableMappings = skuMappings.filter(mapping => {
        if (mapping.originalSku !== item.sku) return false;
        if (!Array.isArray(mapping.tags) || mapping.tags.length === 0) return false;
        // Check for intersection between orderTags and mapping.tags (case-insensitive)
        return mapping.tags.some(mappingTag =>
          orderTags.includes(mappingTag.trim().toLowerCase())
        );
      });

      // If there is at least one applicable mapping, use the first one (or could support multiple)
      if (applicableMappings.length > 0) {
        const mapping = applicableMappings[0];
        // Add to replacements for logging
        replacements.push({
          originalSku: item.sku,
          replacementSku: mapping.replacementSku,
          lineItemId: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          triggeredByTags: mapping.tags
        });

        // Add to items that need updating
        lineItemsToUpdate.push({
          id: item.id,
          sku: mapping.replacementSku,
          originalSku: item.sku
        });
      }
    }
  }

  // If no items need replacement, return early
  if (lineItemsToUpdate.length === 0) {
    return {
      orderId: order.id,
      orderName: order.name,
      status: 'success',
      message: 'No SKUs found that need replacement for the order tags',
      replacements: []
    };
  }

  try {
    // Initialize Shopify session
    const session = {
      shop: process.env.SHOP_URL,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    };

    // For each line item that needs updating, update its variant
    for (const item of lineItemsToUpdate) {
      // Get line item from original order to retrieve variant ID
      const lineItem = order.line_items.find(li => li.id.toString() === item.id.toString());
      if (!lineItem || !lineItem.variant_id) continue;

      // Construct GraphQL mutation to update the line item properties
      const query = `
        mutation orderEditAddVariantLineItem($orderId: ID!, $variantId: ID!, $quantity: Int!, $properties: [AttributeInput!]) {
          orderEditBegin(id: $orderId) {
            calculatedOrder {
              id
            }
            userErrors {
              field
              message
            }
          }
          orderEditAddVariant(
            id: $orderId,
            variantId: $variantId,
            quantity: 1,
            properties: $properties
          ) {
            calculatedLineItem {
              id
              variant {
                id
                sku
              }
            }
            calculatedOrder {
              id
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
            }
            userErrors {
              field
              message
            }
          }
          orderEditCommit(id: $orderId) {
            order {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      // Set up properties to include a note about SKU replacement
      const properties = [
        {
          key: "SKU_Replacement",
          value: `Original SKU (${item.originalSku}) replaced with ${item.sku}`
        }
      ];

      // Get shopify instance
      const shopify = shopifyApi({
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
        scopes: [
          'read_orders', 
          'write_orders', 
          'read_products', 
          'write_products'
        ],
        hostName: process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : '',
        apiVersion: LATEST_API_VERSION,
        isEmbeddedApp: true,
        logger: { level: 0 }
      });
      
      // Execute GraphQL mutation
      await shopify.clients.graphql(session).query({
        data: {
          query,
          variables: {
            orderId: `gid://shopify/Order/${order.id}`,
            variantId: `gid://shopify/ProductVariant/${lineItem.variant_id}`,
            quantity: lineItem.quantity,
            properties
          }
        }
      });
    }

    return {
      orderId: order.id,
      orderName: order.name,
      status: 'success',
      message: `Successfully replaced ${replacements.length} SKUs`,
      replacements
    };
  } catch (error) {
    console.error('Error updating order:', error);
    return {
      orderId: order.id,
      orderName: order.name,
      status: 'error',
      message: 'Error updating order SKUs',
      errorDetails: error.message || error,
      replacements
    };
  }
};

// Configure raw body for webhook verification
router.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Order creation webhook endpoint
router.post('/order-created', async (req, res) => {
  // Verify webhook signature
  if (!verifyShopifyWebhook(req)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid webhook signature');
  }

  // Send 200 response immediately to acknowledge webhook
  res.status(200).send('Webhook received');

  try {
    const order = req.body;
    
    // Process the order and get result
    const result = await processOrder(order);
    
    // Log the processing result
    const processingLog = new ProcessingLog({
      orderId: result.orderId,
      orderName: result.orderName,
      status: result.status,
      message: result.message,
      replacements: result.replacements,
      errorDetails: result.errorDetails
    });
    
    await processingLog.save();
    console.log(`Processed order ${order.name}: ${result.message}`);
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Log error
    try {
      const processingLog = new ProcessingLog({
        orderId: req.body.id || 'unknown',
        orderName: req.body.name || 'unknown',
        status: 'error',
        message: 'Error processing webhook',
        errorDetails: error.message || error
      });
      
      await processingLog.save();
    } catch (logError) {
      console.error('Error saving error log:', logError);
    }
  }
});

// Get all processing logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await ProcessingLog.find().sort({ processedAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get processing logs for a specific order
router.get('/logs/order/:orderId', async (req, res) => {
  try {
    const logs = await ProcessingLog.find({ orderId: req.params.orderId }).sort({ processedAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs for order:', error);
    res.status(500).json({ error: 'Failed to fetch logs for order' });
  }
});

// Register webhook with Shopify
router.post('/register', async (req, res) => {
  try {
    const session = {
      shop: process.env.SHOP_URL,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    };

    // Get shopify instance
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
      scopes: [
        'read_orders', 
        'write_orders', 
        'read_products', 
        'write_products'
      ],
      hostName: process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : '',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
      logger: { level: 0 }
    });
    
    const webhookResponse = await shopify.webhooks.register({
      path: '/api/webhooks/order-created',
      topic: 'orders/create',
      apiVersion: '2023-10',
      accessToken: session.accessToken,
      shop: session.shop,
    });

    if (webhookResponse.success) {
      console.log('Webhook registered successfully!');
      res.status(200).json({ success: true, message: 'Webhook registered successfully' });
    } else {
      console.error('Failed to register webhook:', webhookResponse.result);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register webhook', 
        error: webhookResponse.result 
      });
    }
  } catch (error) {
    console.error('Error registering webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering webhook', 
      error: error.message 
    });
  }
});

module.exports = router;
