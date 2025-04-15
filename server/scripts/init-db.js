/**
 * Database initialization script
 * 
 * This script initializes the database with the initial SKU mappings
 * Run with: node server/scripts/init-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);

// Import the SkuMapping model
const SkuMapping = require('../models/SkuMapping');

// Initial SKU mappings
const initialMappings = [
  {
    originalSku: 'SM-NOX-1-3',
    replacementSku: 'SM-NOX-1-1',
    active: true
  },
  {
    originalSku: 'SM-NOX-1-2',
    replacementSku: 'SM-NOX-1-1',
    active: true
  }
];

async function initializeDatabase() {
  console.log('Connecting to MongoDB...');
  
  try {
    // Ensure MONGODB_URI has the correct format
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify-sku-app';
    console.log(`Attempting to connect to MongoDB with URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check if we already have SKU mappings
    const existingCount = await SkuMapping.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing SKU mappings. Skipping initialization.`);
      console.log('If you want to reset the database, run: db.skumappings.drop() in MongoDB shell');
      process.exit(0);
    }
    
    // Insert initial mappings
    console.log('Initializing database with default SKU mappings...');
    
    const result = await SkuMapping.insertMany(initialMappings);
    console.log(`Successfully created ${result.length} SKU mappings:`);
    
    // Display created mappings
    result.forEach(mapping => {
      console.log(`- ${mapping.originalSku} → ${mapping.replacementSku} (${mapping.active ? 'Active' : 'Inactive'})`);
    });
    
    console.log('\nDatabase initialization complete!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the initialization
initializeDatabase();
