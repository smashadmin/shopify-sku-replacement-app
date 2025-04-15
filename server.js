const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize Shopify API
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
  apiVersion: LATEST_API_VERSION, // Use the latest API version
  isEmbeddedApp: true,
  logger: { level: 0 }
});

// MongoDB connection with retry logic for cloud deployments
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  // Ensure MONGODB_URI has the correct format
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify-sku-app';
  console.log(`Attempting to connect to MongoDB with URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      retries++;
      console.error(`MongoDB connection error (attempt ${retries}/${maxRetries}):`, err);
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.error('Failed to connect to MongoDB after multiple attempts');
  process.exit(1);
};

connectWithRetry();

// Import routes
const skuMappingRoutes = require('./server/routes/skuMappings');
const webhookRoutes = require('./server/routes/webhooks');

// Use routes
app.use('/api/sku-mappings', skuMappingRoutes);
app.use('/api/webhooks', webhookRoutes);

// Default route for React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Handle production errors
if (process.env.NODE_ENV === 'production') {
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    });
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
