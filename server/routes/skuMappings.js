const express = require('express');
const router = express.Router();
const SkuMapping = require('../models/SkuMapping');

// Get all SKU mappings
router.get('/', async (req, res) => {
  try {
    const skuMappings = await SkuMapping.find().sort({ createdAt: -1 });
    res.json(skuMappings);
  } catch (error) {
    console.error('Error fetching SKU mappings:', error);
    res.status(500).json({ error: 'Failed to fetch SKU mappings' });
  }
});

// Get a specific SKU mapping
router.get('/:id', async (req, res) => {
  try {
    const skuMapping = await SkuMapping.findById(req.params.id);
    if (!skuMapping) {
      return res.status(404).json({ error: 'SKU mapping not found' });
    }
    res.json(skuMapping);
  } catch (error) {
    console.error('Error fetching SKU mapping:', error);
    res.status(500).json({ error: 'Failed to fetch SKU mapping' });
  }
});

// Create a new SKU mapping
router.post('/', async (req, res) => {
  try {
    const { originalSku, replacementSku, tags } = req.body;
    
    // Validate required fields
    if (!originalSku || !replacementSku) {
      return res.status(400).json({ error: 'Both original SKU and replacement SKU are required' });
    }
    
    // Check if mapping already exists
    const existingMapping = await SkuMapping.findOne({ originalSku });
    if (existingMapping) {
      return res.status(400).json({ error: 'A mapping for this original SKU already exists' });
    }
    
    const newSkuMapping = new SkuMapping({
      originalSku,
      replacementSku,
      tags: Array.isArray(tags) ? tags : [],
      active: true
    });
    
    await newSkuMapping.save();
    res.status(201).json(newSkuMapping);
  } catch (error) {
    console.error('Error creating SKU mapping:', error);
    res.status(500).json({ error: 'Failed to create SKU mapping' });
  }
});

// Update a SKU mapping
router.put('/:id', async (req, res) => {
  try {
    const { originalSku, replacementSku, tags, active } = req.body;
    
    // Find and update the mapping
    const updatedMapping = await SkuMapping.findByIdAndUpdate(
      req.params.id,
      { 
        originalSku, 
        replacementSku, 
        tags: Array.isArray(tags) ? tags : undefined, 
        active, 
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedMapping) {
      return res.status(404).json({ error: 'SKU mapping not found' });
    }
    
    res.json(updatedMapping);
  } catch (error) {
    console.error('Error updating SKU mapping:', error);
    res.status(500).json({ error: 'Failed to update SKU mapping' });
  }
});

// Delete a SKU mapping
router.delete('/:id', async (req, res) => {
  try {
    const deletedMapping = await SkuMapping.findByIdAndDelete(req.params.id);
    
    if (!deletedMapping) {
      return res.status(404).json({ error: 'SKU mapping not found' });
    }
    
    res.json({ message: 'SKU mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting SKU mapping:', error);
    res.status(500).json({ error: 'Failed to delete SKU mapping' });
  }
});

// Bulk import SKU mappings
router.post('/bulk', async (req, res) => {
  try {
    const { mappings } = req.body;
    
    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({ error: 'Invalid mappings format or empty mappings array' });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const mapping of mappings) {
      try {
        const { originalSku, replacementSku, tags } = mapping;
        
        if (!originalSku || !replacementSku) {
          results.failed++;
          results.errors.push(`Missing required fields for mapping: ${JSON.stringify(mapping)}`);
          continue;
        }
        
        // Check if mapping already exists
        const existingMapping = await SkuMapping.findOne({ originalSku });
        if (existingMapping) {
          // Update existing mapping
          existingMapping.replacementSku = replacementSku;
          if (Array.isArray(tags)) {
            existingMapping.tags = tags;
          }
          existingMapping.updatedAt = Date.now();
          await existingMapping.save();
        } else {
          // Create new mapping
          const newMapping = new SkuMapping({
            originalSku,
            replacementSku,
            tags: Array.isArray(tags) ? tags : [],
            active: true
          });
          await newMapping.save();
        }
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error processing mapping: ${JSON.stringify(mapping)} - ${error.message}`);
      }
    }
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ error: 'Failed to process bulk import' });
  }
});

module.exports = router;
