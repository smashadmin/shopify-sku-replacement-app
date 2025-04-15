const mongoose = require('mongoose');

const ProcessingLogSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    trim: true
  },
  orderName: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true
  },
  message: {
    type: String
  },
  replacements: [{
    originalSku: String,
    replacementSku: String,
    lineItemId: String,
    productId: String,
    variantId: String
  }],
  errorDetails: {
    type: Object
  }
});

module.exports = mongoose.model('ProcessingLog', ProcessingLogSchema);
