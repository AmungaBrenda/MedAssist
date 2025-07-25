const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '254712345678',
    password: 'password123',
    role: 'user',
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921] // Nairobi coordinates [longitude, latitude]
    },
    address: 'Westlands, Nairobi'
  },
  {
    name: 'PharmaCare Owner',
    email: 'pharmacare@example.com',
    phone: '254723456789',
    password: 'password123',
    role: 'pharmacy',
    location: {
      type: 'Point',
      coordinates: [36.8200, -1.2900]
    },
    address: 'CBD, Nairobi'
  },
  {
    name: 'HealthPlus Owner',
    email: 'healthplus@example.com',
    phone: '254734567890',
    password: 'password123',
    role: 'pharmacy',
    location: {
      type: 'Point',
      coordinates: [36.8250, -1.2850]
    },
    address: 'Karen, Nairobi'
  }
];

const sampleMedicines = [
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brand: 'Panadol',
    category: 'tablet',
    description: 'Pain reliever and fever reducer',
    dosage: '500mg',
    manufacturer: 'GSK',
    requiresPrescription: false,
    activeIngredients: ['Acetaminophen']
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brand: 'Amoxil',
    category: 'capsule',
    description: 'Antibiotic for bacterial infections',
    dosage: '250mg',
    manufacturer: 'Pfizer',
    requiresPrescription: true,
    activeIngredients: ['Amoxicillin']
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brand: 'Brufen',
    category: 'tablet',
    description: 'Anti-inflammatory and pain reliever',
    dosage: '200mg',
    manufacturer: 'Abbott',
    requiresPrescription: false,
    activeIngredients: ['Ibuprofen']
  },
  {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brand: 'Losec',
    category: 'capsule',
    description: 'Proton pump inhibitor for acid reflux',
    dosage: '20mg',
    manufacturer: 'AstraZeneca',
    requiresPrescription: true,
    activeIngredients: ['Omeprazole']
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine HCl',
    brand: 'Zyrtec',
    category: 'tablet',
    description: 'Antihistamine for allergies',
    dosage: '10mg',
    manufacturer: 'UCB',
    requiresPrescription: false,
    activeIngredients: ['Cetirizine Hydrochloride']
  },
  {
    name: 'Metformin',
    genericName: 'Metformin',
    brand: 'Glucophage',
    category: 'tablet',
    description: 'Diabetes medication',
    dosage: '500mg',
    manufacturer: 'Bristol Myers Squibb',
    requiresPrescription: true,
    activeIngredients: ['Metformin Hydrochloride']
  },
  {
    name: 'Cough Syrup',
    genericName: 'Dextromethorphan',
    brand: 'Robitussin',
    category: 'syrup',
    description: 'Cough suppressant',
    dosage: '15mg/5ml',
    manufacturer: 'Pfizer',
    requiresPrescription: false,
    activeIngredients: ['Dextromethorphan']
  },
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    brand: 'Disprin',
    category: 'tablet',
    description: 'Pain reliever and blood thinner',
    dosage: '100mg',
    manufacturer: 'Bayer',
    requiresPrescription: false,
    activeIngredients: ['Acetylsalicylic Acid']
  }
];

// Kenyan pharmacies data
const createPharmaciesData = (users) => [
  {
    owner: users[1]._id, // PharmaCare Owner
    name: 'PharmaCare Westlands',
    license: 'PH/2024/001',
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921] // Westlands
    },
    address: 'Westlands Shopping Mall, Waiyaki Way, Nairobi',
    phone: '254720123456',
    email: 'westlands@pharmacare.co.ke',
    operatingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    rating: 4.5,
    totalReviews: 125,
    isVerified: true,
    isActive: true,
    services: ['prescription', 'consultation', 'delivery']
  },
  {
    owner: users[2]._id, // HealthPlus Owner
    name: 'HealthPlus Karen',
    license: 'PH/2024/002',
    location: {
      type: 'Point',
      coordinates: [36.6826, -1.3194] // Karen
    },
    address: 'Karen Shopping Centre, Karen Road, Nairobi',
    phone: '254721234567',
    email: 'karen@healthplus.co.ke',
    operatingHours: {
      monday: { open: '07:00', close: '21:00', closed: false },
      tuesday: { open: '07:00', close: '21:00', closed: false },
      wednesday: { open: '07:00', close: '21:00', closed: false },
      thursday: { open: '07:00', close: '21:00', closed: false },
      friday: { open: '07:00', close: '21:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: false }
    },
    rating: 4.7,
    totalReviews: 89,
    isVerified: true,
    isActive: true,
    services: ['prescription', 'delivery', 'insurance']
  },
  {
    owner: users[1]._id, // PharmaCare Owner (second branch)
    name: 'MediCare CBD',
    license: 'PH/2024/003',
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2864] // CBD
    },
    address: 'Kimathi Street, CBD, Nairobi',
    phone: '254722345678',
    email: 'cbd@medicare.co.ke',
    operatingHours: {
      monday: { open: '08:00', close: '19:00', closed: false },
      tuesday: { open: '08:00', close: '19:00', closed: false },
      wednesday: { open: '08:00', close: '19:00', closed: false },
      thursday: { open: '08:00', close: '19:00', closed: false },
      friday: { open: '08:00', close: '19:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true }
    },
    rating: 4.2,
    totalReviews: 203,
    isVerified: true,
    isActive: true,
    services: ['prescription', 'consultation']
  },
  {
    owner: users[2]._id, // HealthPlus Owner (second branch)
    name: 'QuickMeds Kilimani',
    license: 'PH/2024/004',
    location: {
      type: 'Point',
      coordinates: [36.7872, -1.2958] // Kilimani
    },
    address: 'Yaya Centre, Kilimani, Nairobi',
    phone: '254723456789',
    email: 'kilimani@quickmeds.co.ke',
    operatingHours: {
      monday: { open: '24:00', close: '24:00', closed: false },
      tuesday: { open: '24:00', close: '24:00', closed: false },
      wednesday: { open: '24:00', close: '24:00', closed: false },
      thursday: { open: '24:00', close: '24:00', closed: false },
      friday: { open: '24:00', close: '24:00', closed: false },
      saturday: { open: '24:00', close: '24:00', closed: false },
      sunday: { open: '24:00', close: '24:00', closed: false }
    },
    rating: 4.8,
    totalReviews: 156,
    isVerified: true,
    isActive: true,
    services: ['prescription', 'consultation', 'delivery', 'insurance']
  },
  {
    owner: users[1]._id,
    name: 'FamilyCare Pharmacy Eastlands',
    license: 'PH/2024/005',
    location: {
      type: 'Point',
      coordinates: [36.8908, -1.2743] // Eastlands
    },
    address: 'Eastleigh Shopping Mall, Eastlands, Nairobi',
    phone: '254724567890',
    email: 'eastlands@familycare.co.ke',
    operatingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: false }
    },
    rating: 4.1,
    totalReviews: 67,
    isVerified: true,
    isActive: true,
    services: ['prescription', 'delivery']
  }
];

// Create inventory data
const createInventoryData = (pharmacies, medicines) => {
  const inventory = [];
  
  pharmacies.forEach((pharmacy) => {
    medicines.forEach((medicine, index) => {
      // Not every pharmacy has every medicine
      if (Math.random() > 0.3) { // 70% chance a pharmacy has a medicine
        const basePrice = 50 + (index * 25); // Varying prices
        const variation = Math.random() * 20 - 10; // ±10 price variation
        const price = Math.max(10, basePrice + variation);
        
        const quantity = Math.floor(Math.random() * 100) + 5; // 5-104 quantity
        
        inventory.push({
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          quantity: quantity,
          price: Math.round(price),
          discountPrice: Math.random() > 0.7 ? Math.round(price * 0.9) : undefined, // 30% chance of discount
          minQuantityAlert: 10
        });
      }
    });
  });
  
  return inventory;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});

    // Hash passwords for users
    for (let user of sampleUsers) {
      user.password = await bcrypt.hash(user.password, 12);
    }

    // Create users
    console.log('Creating users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create medicines
    console.log('Creating medicines...');
    const medicines = await Medicine.insertMany(sampleMedicines);
    console.log(`Created ${medicines.length} medicines`);

    // Create pharmacies
    console.log('Creating pharmacies...');
    const pharmaciesData = createPharmaciesData(users);
    const pharmacies = await Pharmacy.insertMany(pharmaciesData);
    console.log(`Created ${pharmacies.length} pharmacies`);

    // Create inventory
    console.log('Creating inventory...');
    const inventoryData = createInventoryData(pharmacies, medicines);
    const inventory = await Inventory.insertMany(inventoryData);
    console.log(`Created ${inventory.length} inventory items`);

    console.log('\n=== DATABASE SEEDED SUCCESSFULLY ===');
    console.log('\nTest Accounts Created:');
    console.log('1. Regular User:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('\n2. Pharmacy Owner 1:');
    console.log('   Email: pharmacare@example.com');
    console.log('   Password: password123');
    console.log('\n3. Pharmacy Owner 2:');
    console.log('   Email: healthplus@example.com');
    console.log('   Password: password123');

    console.log('\nPharmacies Created:');
    pharmacies.forEach((pharmacy, index) => {
      console.log(`${index + 1}. ${pharmacy.name} - ${pharmacy.address}`);
    });

    console.log('\nMedicines Available:');
    medicines.forEach((medicine, index) => {
      console.log(`${index + 1}. ${medicine.name} (${medicine.brand}) - ${medicine.category}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();