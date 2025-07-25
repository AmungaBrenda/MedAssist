const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa'],
    default: 'mpesa'
  },
  mpesaDetails: {
    phoneNumber: String,
    mpesaReceiptNumber: String,
    transactionDate: Date,
    checkoutRequestId: String
  },
  features: {
    maxSearchesPerDay: {
      type: Number,
      default: function() {
        return this.plan === 'basic' ? 50 : 1000;
      }
    },
    canViewPrices: {
      type: Boolean,
      default: true
    },
    canGetAlerts: {
      type: Boolean,
      default: function() {
        return this.plan !== 'free';
      }
    },
    canAccessTelemedicine: {
      type: Boolean,
      default: function() {
        return this.plan === 'premium';
      }
    },
    prioritySupport: {
      type: Boolean,
      default: function() {
        return this.plan === 'premium';
      }
    }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);