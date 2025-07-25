const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');

const additionalPharmacies = [
  {
    name: 'Alpha Pharmacy Thika Road',
    license: 'PH/2024/006',
    location: [36.8908, -1.2197], // Thika Road
    address: 'Thika Road Mall, Thika Road, Nairobi',
    phone: '254725678901',
    email: 'thika@alphapharmacy.co.ke',
    rating: 4.3,
    totalReviews: 94
  },
  {
    name: 'GreenCross Pharmacy Mombasa Road',
    license: 'PH/2024/007',
    location: [36.8517, -1.3326], // Mombasa Road
    address: 'Gateway Mall, Mombasa Road, Nairobi',
    phone: '254726789012',
    email: 'mombasa@greencross.co.ke',
    rating: 4.6,
    totalReviews: 112
  },
  {
    name: 'MediPlus Pharmacy Ngong Road',
    license: 'PH/2024/008',
    location: [36.7595, -1.3031], // Ngong Road
    address: 'Prestige Plaza, Ngong Road, Nairobi',
    phone: '254727890123',
    email: 'ngong@mediplus.co.ke',
    rating: 4.4,
    totalReviews: 78
  },
  {
    name: 'CityMed Pharmacy Upper Hill',
    license: 'PH/2024/009',
    location: [36.8175, -1.2831], // Upper Hill
    address: 'Rahimtulla Tower, Upper Hill, Nairobi',
    phone: '254728901234',
    email: 'upperhill@citymed.co.ke',
    rating: 4.7,
    totalReviews: 134
  },
  {
    name: 'LifeCare Pharmacy Langata',
    license: 'PH/2024/010',
    location: [36.7219, -1.3667], // Langata
    address: 'T-Mall, Langata Road, Nairobi',
    phone: '254729012345',
    email: 'langata@lifecare.co.ke',
    rating: 4.2,
    totalReviews: 56
  }
];

const addMorePharmacies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a pharmacy owner user
    const pharmacyOwner = await User.findOne({ role: 'pharmacy' });
    if (!pharmacyOwner) {
      console.error('No pharmacy owner found. Please run the main seeder first.');
      process.exit(1);
    }

    // Get all medicines for inventory
    const medicines = await Medicine.find({});

    // Create pharmacies
    const createdPharmacies = [];
    for (const pharmacyData of additionalPharmacies) {
      const pharmacy = await Pharmacy.create({
        owner: pharmacyOwner._id,
        name: pharmacyData.name,
        license: pharmacyData.license,
        location: {
          type: 'Point',
          coordinates: pharmacyData.location
        },
        address: pharmacyData.address,
        phone: pharmacyData.phone,
        email: pharmacyData.email,
        operatingHours: {
          monday: { open: '08:00', close: '20:00', closed: false },
          tuesday: { open: '08:00', close: '20:00', closed: false },
          wednesday: { open: '08:00', close: '20:00', closed: false },
          thursday: { open: '08:00', close: '20:00', closed: false },
          friday: { open: '08:00', close: '20:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        rating: pharmacyData.rating,
        totalReviews: pharmacyData.totalReviews,
        isVerified: true,
        isActive: true,
        services: ['prescription', 'consultation', 'delivery']
      });

      createdPharmacies.push(pharmacy);

      // Add inventory for each pharmacy
      const inventoryItems = [];
      for (const medicine of medicines) {
        if (Math.random() > 0.2) { // 80% chance pharmacy has this medicine
          const basePrice = 50 + Math.random() * 200;
          const quantity = Math.floor(Math.random() * 100) + 5;
          
          inventoryItems.push({
            pharmacy: pharmacy._id,
            medicine: medicine._id,
            quantity: quantity,
            price: Math.round(basePrice),
            discountPrice: Math.random() > 0.7 ? Math.round(basePrice * 0.9) : undefined,
            minQuantityAlert: 10
          });
        }
      }

      await Inventory.insertMany(inventoryItems);
      console.log(`Created ${pharmacy.name} with ${inventoryItems.length} medicines`);
    }

    console.log(`\nSuccessfully added ${createdPharmacies.length} more pharmacies!`);
    console.log('\nNew Pharmacies:');
    createdPharmacies.forEach((pharmacy, index) => {
      console.log(`${index + 1}. ${pharmacy.name} - ${pharmacy.address}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding pharmacies:', error);
    process.exit(1);
  }
};

addMorePharmacies();