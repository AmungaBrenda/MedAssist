const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide medicine name'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 
      'ointment', 'powder', 'suspension', 'gel', 'patch', 'suppository', 'other'
    ]
  },
  therapeuticClass: {
    type: String,
    enum: [
      'oncology', 'diabetes', 'hypertension', 'antibiotics', 'painkillers', 
      'vitamins', 'supplements', 'cardiovascular', 'respiratory', 'gastro', 
      'dermatology', 'pediatrics', 'mental_health', 'contraceptives', 'general'
    ],
    required: true
  },
  description: String,
  dosage: String,
  strength: String,
  manufacturer: String,
  batchNumber: String,
  expiryDate: Date,
  barcode: String,
  image: String,
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  isControlled: {
    type: Boolean,
    default: false
  },
  sideEffects: [String],
  contraindications: [String],
  activeIngredients: [String],
  indications: [String],
  dosageInstructions: String,
  warnings: [String],
  storageInstructions: String,
  pregnancyCategory: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'X', 'N/A'],
    default: 'N/A'
  }
}, {
  timestamps: true
});

medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text' });
medicineSchema.index({ therapeuticClass: 1 });
medicineSchema.index({ category: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);