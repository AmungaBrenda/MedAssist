const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide pharmacy name'],
    trim: true
  },
  license: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  town: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  website: String,
  operatingHours: {
    monday: { 
      open: { type: String, default: '08:00' }, 
      close: { type: String, default: '18:00' }, 
      closed: { type: Boolean, default: false } 
    },
    tuesday: { 
      open: { type: String, default: '08:00' }, 
      close: { type: String, default: '18:00' }, 
      closed: { type: Boolean, default: false } 
    },
    wednesday: { 
      open: { type: String, default: '08:00' }, 
      close: { type: String, default: '18:00' }, 
      closed: { type: Boolean, default: false } 
    },
    thursday: { 
      open: { type: String, default: '08:00' }, 
      close: { type: String, default: '18:00' }, 
      closed: { type: Boolean, default: false } 
    },
    friday: { 
      open: { type: String, default: '08:00' }, 
      close: { type: String, default: '18:00' }, 
      closed: { type: Boolean, default: false } 
    },
    saturday: { 
      open: { type: String, default: '09:00' }, 
      close: { type: String, default: '17:00' }, 
      closed: { type: Boolean, default: false } 
    },
    sunday: { 
      open: { type: String, default: '10:00' }, 
      close: { type: String, default: '16:00' }, 
      closed: { type: Boolean, default: false } 
    }
  },
  images: [String],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  is24Hours: {
    type: Boolean,
    default: false
  },
  services: [{
    type: String,
    enum: ['prescription', 'consultation', 'delivery', 'insurance', 'vaccination', 'blood_pressure_check', 'diabetes_testing']
  }],
  specialties: [{
    type: String,
    enum: ['oncology', 'diabetes', 'hypertension', 'pediatrics', 'geriatrics', 'general']
  }],
  deliveryRadius: {
    type: Number,
    default: 5
  },
  deliveryFee: {
    type: Number,
    default: 200
  }
}, {
  timestamps: true
});

pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ county: 1, town: 1 });
pharmacySchema.index({ specialties: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);