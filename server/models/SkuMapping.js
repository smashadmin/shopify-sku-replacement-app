const mongoose = require('mongoose');

const SkuMappingSchema = new mongoose.Schema({
  originalSku: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  replacementSku: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the 'updatedAt' field
SkuMappingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SkuMapping', SkuMappingSchema);
