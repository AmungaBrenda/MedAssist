const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  pharmacy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: Number,
  minQuantityAlert: {
    type: Number,
    default: 10
  },
  maxQuantityPerCustomer: {
    type: Number,
    default: 100
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'available'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  batchNumber: String
}, {
  timestamps: true
});

inventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });
inventorySchema.index({ medicine: 1, status: 1 });
inventorySchema.index({ pharmacy: 1, status: 1 });

inventorySchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minQuantityAlert) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);