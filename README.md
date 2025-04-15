# Shopify SKU Replacement App

A custom Shopify app that automatically identifies orders with specific tags and replaces SKUs for free sample products.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Features

- Monitors new orders tagged with "Free sample"
- Identifies line items with specific SKUs and price of 0
- Automatically replaces targeted SKUs with alternatives before order fulfillment
- Provides an admin interface to manage SKU mappings
- Logs all replacement activities for monitoring and troubleshooting
- Supports bulk import/export of SKU mappings

## Initial SKU Mappings

The app comes pre-configured to handle the following SKU replacements for free samples:
- SM-NOX-1-3 → SM-NOX-1-1
- SM-NOX-1-2 → SM-NOX-1-1

## Prerequisites

- Node.js 14 or higher
- MongoDB
- Shopify Partner Account
- Shopify store with API access

## Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/shopify-sku-replacement-app.git
cd shopify-sku-replacement-app
```

2. Install dependencies
```bash
npm install
```

3. Create an `.env` file from the template
```bash
cp .env.example .env
```

4. Update the `.env` file with your Shopify API credentials, webhook secret, and other configuration values

5. Start the server
```bash
npm start
```

## Shopify App Setup

1. In your Shopify Partner dashboard, create a new custom app
2. Set the Application URL to your server's URL
3. Request the following scopes:
   - `read_orders`
   - `write_orders`
   - `read_products`
   - `write_products`
4. Generate API credentials and add them to your `.env` file
5. Register a webhook for the `orders/create` event

## Usage

### Managing SKU Mappings

1. Access the admin interface at `http://your-server-url`
2. Use the "SKU Mappings" tab to add, edit, or delete individual mappings
3. Use the bulk import feature to add multiple mappings at once

### Viewing Processing Logs

The "Processing Logs" tab shows all order processing activities, including:
- Successfully processed orders
- SKU replacements made
- Errors encountered during processing

### Webhook Registration

Use the "Settings" tab to register the webhook with your Shopify store. This is required for the app to receive order creation events.

## Architecture

- **Backend**: Node.js with Express
- **Database**: MongoDB for storing SKU mappings and processing logs
- **API**: Shopify GraphQL and REST APIs for order management
- **Frontend**: HTML, CSS, and JavaScript with Bootstrap 5

## Webhook Flow

1. When a new order is created in Shopify, a webhook is triggered
2. The app verifies the webhook signature
3. The app checks if the order has the "Free sample" tag
4. If tagged, the app checks line items for specific SKUs with price 0
5. For matching items, the app replaces the SKUs based on configured mappings
6. All activities are logged for monitoring

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## License

[MIT](LICENSE)

## Deployment

### GitHub Repository Setup

1. Initialize Git repository:
```bash
cd shopify-sku-replacement-app
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Connect and push to your GitHub repository:
```bash
git remote add origin https://github.com/yourusername/shopify-sku-replacement-app.git
git branch -M main
git push -u origin main
```

### Deploying to Render.com

1. Sign in to your [Render.com](https://render.com) account

2. Click "New +" and select "Blueprint"

3. Connect to your GitHub repository

4. Render will automatically detect the `render.yaml` file and set up your services

5. Fill in the required environment variables:
   - `SHOPIFY_API_KEY` - Your Shopify API key
   - `SHOPIFY_API_SECRET_KEY` - Your Shopify API secret key
   - `SHOPIFY_ACCESS_TOKEN` - Your Shopify access token
   - `SHOPIFY_WEBHOOK_SECRET` - Your Shopify webhook secret
   - `SHOP_URL` - Your Shopify store URL (e.g., your-store.myshopify.com)
   - `HOST` - Your Render.com service URL (e.g., https://shopify-sku-replacement.onrender.com)

6. Click "Apply" to start the deployment

7. Once deployed, update your Shopify app's URL settings to point to your Render.com URL

8. Use the "Settings" tab in the app interface to register the webhook with your Shopify store

### MongoDB Setup

Render will automatically create and configure a MongoDB database based on the `render.yaml` blueprint. No additional setup is required for database deployment.
