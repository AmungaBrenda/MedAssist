const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'pharmacy', 'doctor', 'admin'],
    default: 'user'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [36.8219, -1.2921]
    }
  },
  address: String,
  profileImage: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  subscriptionHistory: [{
    plan: String,
    amount: Number,
    startDate: Date,
    endDate: Date,
    mpesaReceiptNumber: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);