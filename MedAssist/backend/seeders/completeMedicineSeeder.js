const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');

// Comprehensive medicine database
const medicinesDatabase = [
  // ONCOLOGY MEDICINES
  {
    name: 'Methotrexate',
    genericName: 'Methotrexate',
    brand: 'Trexall',
    category: 'injection',
    therapeuticClass: 'oncology',
    description: 'Chemotherapy medication for cancer treatment',
    dosage: '25mg/ml',
    strength: '25mg',
    manufacturer: 'Pfizer',
    requiresPrescription: true,
    isControlled: true,
    indications: ['Breast cancer', 'Lung cancer', 'Leukemia'],
    warnings: ['Severe side effects', 'Regular monitoring required'],
    pregnancyCategory: 'X'
  },
  {
    name: 'Tamoxifen',
    genericName: 'Tamoxifen Citrate',
    brand: 'Nolvadex',
    category: 'tablet',
    therapeuticClass: 'oncology',
    description: 'Hormone therapy for breast cancer',
    dosage: '20mg',
    strength: '20mg',
    manufacturer: 'AstraZeneca',
    requiresPrescription: true,
    isControlled: true,
    indications: ['Breast cancer treatment', 'Breast cancer prevention'],
    warnings: ['Blood clot risk', 'Regular gynecological exams needed'],
    pregnancyCategory: 'D'
  },
  {
    name: 'Cyclophosphamide',
    genericName: 'Cyclophosphamide',
    brand: 'Cytoxan',
    category: 'injection',
    therapeuticClass: 'oncology',
    description: 'Chemotherapy drug for various cancers',
    dosage: '500mg/vial',
    strength: '500mg',
    manufacturer: 'Bristol Myers Squibb',
    requiresPrescription: true,
    isControlled: true,
    indications: ['Lymphoma', 'Breast cancer', 'Ovarian cancer'],
    warnings: ['Immunosuppression', 'Fertility effects'],
    pregnancyCategory: 'D'
  },

  // DIABETES MEDICINES
  {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brand: 'Glucophage',
    category: 'tablet',
    therapeuticClass: 'diabetes',
    description: 'First-line medication for Type 2 diabetes',
    dosage: '500mg',
    strength: '500mg',
    manufacturer: 'Bristol Myers Squibb',
    requiresPrescription: true,
    indications: ['Type 2 diabetes', 'Prediabetes', 'PCOS'],
    warnings: ['Lactic acidosis risk', 'Kidney function monitoring'],
    pregnancyCategory: 'B'
  },
  {
    name: 'Insulin Glargine',
    genericName: 'Insulin Glargine',
    brand: 'Lantus',
    category: 'injection',
    therapeuticClass: 'diabetes',
    description: 'Long-acting insulin for diabetes management',
    dosage: '100 units/ml',
    strength: '100 units/ml',
    manufacturer: 'Sanofi',
    requiresPrescription: true,
    indications: ['Type 1 diabetes', 'Type 2 diabetes'],
    warnings: ['Hypoglycemia risk', 'Injection site rotation'],
    storageInstructions: 'Refrigerate, do not freeze',
    pregnancyCategory: 'B'
  },
  {
    name: 'Gliclazide',
    genericName: 'Gliclazide',
    brand: 'Diamicron',
    category: 'tablet',
    therapeuticClass: 'diabetes',
    description: 'Sulfonylurea for Type 2 diabetes',
    dosage: '80mg',
    strength: '80mg',
    manufacturer: 'Servier',
    requiresPrescription: true,
    indications: ['Type 2 diabetes'],
    warnings: ['Hypoglycemia risk', 'Regular blood sugar monitoring'],
    pregnancyCategory: 'C'
  },

  // HYPERTENSION MEDICINES
  {
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brand: 'Norvasc',
    category: 'tablet',
    therapeuticClass: 'hypertension',
    description: 'Calcium channel blocker for high blood pressure',
    dosage: '5mg',
    strength: '5mg',
    manufacturer: 'Pfizer',
    requiresPrescription: true,
    indications: ['High blood pressure', 'Angina'],
    warnings: ['Ankle swelling', 'Dizziness'],
    pregnancyCategory: 'C'
  },
  {
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brand: 'Prinivil',
    category: 'tablet',
    therapeuticClass: 'hypertension',
    description: 'ACE inhibitor for hypertension and heart failure',
    dosage: '10mg',
    strength: '10mg',
    manufacturer: 'Merck',
    requiresPrescription: true,
    indications: ['High blood pressure', 'Heart failure', 'Post-MI'],
    warnings: ['Dry cough', 'Hyperkalemia', 'Angioedema'],
    pregnancyCategory: 'D'
  },
  {
    name: 'Hydrochlorothiazide',
    genericName: 'Hydrochlorothiazide',
    brand: 'Microzide',
    category: 'tablet',
    therapeuticClass: 'hypertension',
    description: 'Thiazide diuretic for hypertension',
    dosage: '25mg',
    strength: '25mg',
    manufacturer: 'Various',
    requiresPrescription: true,
    indications: ['High blood pressure', 'Edema'],
    warnings: ['Dehydration', 'Electrolyte imbalance'],
    pregnancyCategory: 'B'
  },

  // DAILY USE MEDICINES
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brand: 'Panadol',
    category: 'tablet',
    therapeuticClass: 'painkillers',
    description: 'Pain reliever and fever reducer',
    dosage: '500mg',
    strength: '500mg',
    manufacturer: 'GSK',
    requiresPrescription: false,
    indications: ['Pain relief', 'Fever reduction', 'Headache'],
    warnings: ['Liver damage with overdose', 'Maximum 4g per day'],
    pregnancyCategory: 'B'
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brand: 'Brufen',
    category: 'tablet',
    therapeuticClass: 'painkillers',
    description: 'NSAID for pain and inflammation',
    dosage: '200mg',
    strength: '200mg',
    manufacturer: 'Abbott',
    requiresPrescription: false,
    indications: ['Pain relief', 'Inflammation', 'Fever'],
    warnings: ['GI bleeding risk', 'Take with food'],
    pregnancyCategory: 'C'
  },
  {
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    brand: 'Amoxil',
    category: 'capsule',
    therapeuticClass: 'antibiotics',
    description: 'Broad-spectrum antibiotic',
    dosage: '250mg',
    strength: '250mg',
    manufacturer: 'GSK',
    requiresPrescription: true,
    indications: ['Bacterial infections', 'Respiratory infections'],
    warnings: ['Complete full course', 'Allergy risk'],
    pregnancyCategory: 'B'
  },
  {
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    brand: 'Zyrtec',
    category: 'tablet',
    therapeuticClass: 'general',
    description: 'Antihistamine for allergies',
    dosage: '10mg',
    strength: '10mg',
    manufacturer: 'UCB',
    requiresPrescription: false,
    indications: ['Allergic rhinitis', 'Urticaria', 'Hay fever'],
    warnings: ['Drowsiness possible', 'Avoid alcohol'],
    pregnancyCategory: 'B'
  },
  {
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    brand: 'Losec',
    category: 'capsule',
    therapeuticClass: 'gastro',
    description: 'Proton pump inhibitor for acid reflux',
    dosage: '20mg',
    strength: '20mg',
    manufacturer: 'AstraZeneca',
    requiresPrescription: true,
    indications: ['GERD', 'Peptic ulcers', 'H. pylori infection'],
    warnings: ['Long-term use risks', 'B12 deficiency'],
    pregnancyCategory: 'C'
  },
  {
    name: 'Multivitamin',
    genericName: 'Multivitamin Complex',
    brand: 'Centrum',
    category: 'tablet',
    therapeuticClass: 'vitamins',
    description: 'Daily multivitamin supplement',
    dosage: '1 tablet',
    strength: 'Various',
    manufacturer: 'Pfizer',
    requiresPrescription: false,
    indications: ['Nutritional supplement', 'Vitamin deficiency prevention'],
    warnings: ['Do not exceed recommended dose'],
    pregnancyCategory: 'A'
  },
  {
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    brand: 'D-Cal',
    category: 'tablet',
    therapeuticClass: 'vitamins',
    description: 'Vitamin D supplement',
    dosage: '1000 IU',
    strength: '1000 IU',
    manufacturer: 'Various',
    requiresPrescription: false,
    indications: ['Vitamin D deficiency', 'Bone health'],
    warnings: ['Hypercalcemia with overdose'],
    pregnancyCategory: 'A'
  },
  {
    name: 'Oral Rehydration Salts',
    genericName: 'ORS',
    brand: 'WHO-ORS',
    category: 'powder',
    therapeuticClass: 'general',
    description: 'Electrolyte replacement therapy',
    dosage: '1 sachet in 1L water',
    strength: 'Standard WHO formula',
    manufacturer: 'Various',
    requiresPrescription: false,
    indications: ['Dehydration', 'Diarrhea', 'Vomiting'],
    warnings: ['Prepare fresh solution daily'],
    pregnancyCategory: 'A'
  },
  {
    name: 'Cough Syrup',
    genericName: 'Dextromethorphan',
    brand: 'Robitussin',
    category: 'syrup',
    therapeuticClass: 'respiratory',
    description: 'Cough suppressant',
    dosage: '15mg/5ml',
    strength: '15mg/5ml',
    manufacturer: 'Pfizer',
    requiresPrescription: false,
    indications: ['Dry cough', 'Cold symptoms'],
    warnings: ['Drowsiness', 'Do not exceed recommended dose'],
    pregnancyCategory: 'C'
  },
  // Additional medicines for better coverage
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    brand: 'Disprin',
    category: 'tablet',
    therapeuticClass: 'cardiovascular',
    description: 'Blood thinner and pain reliever',
    dosage: '75mg',
    strength: '75mg',
    manufacturer: 'Bayer',
    requiresPrescription: false,
    indications: ['Heart disease prevention', 'Stroke prevention', 'Pain relief'],
    warnings: ['Bleeding risk', 'Not for children'],
    pregnancyCategory: 'C'
  },
  {
    name: 'Furosemide',
    genericName: 'Furosemide',
    brand: 'Lasix',
    category: 'tablet',
    therapeuticClass: 'cardiovascular',
    description: 'Loop diuretic for heart failure',
    dosage: '40mg',
    strength: '40mg',
    manufacturer: 'Sanofi',
    requiresPrescription: true,
    indications: ['Heart failure', 'Edema', 'Hypertension'],
    warnings: ['Dehydration', 'Electrolyte monitoring'],
    pregnancyCategory: 'C'
  },
  {
    name: 'Salbutamol',
    genericName: 'Salbutamol',
    brand: 'Ventolin',
    category: 'inhaler',
    therapeuticClass: 'respiratory',
    description: 'Bronchodilator for asthma',
    dosage: '100mcg/dose',
    strength: '100mcg',
    manufacturer: 'GSK',
    requiresPrescription: true,
    indications: ['Asthma', 'COPD', 'Bronchospasm'],
    warnings: ['Overuse risk', 'Tremors'],
    pregnancyCategory: 'C'
  }
];

// Kenyan pharmacy locations
const kenyaPharmacies = [
  {
    name: 'Nairobi Hospital Pharmacy',
    license: 'PH/2024/001',
    coordinates: [36.8125, -1.2966],
    address: 'Nairobi Hospital, Argwings Kodhek Road',
    county: 'Nairobi',
    town: 'Nairobi',
    phone: '+254726013909',
    email: 'pharmacy@nairobihospital.org',
    specialties: ['oncology', 'diabetes', 'hypertension', 'general'],
    is24Hours: true,
    services: ['prescription', 'consultation', 'delivery', 'insurance'],
    rating: 4.8
  },
  {
    name: 'Kenyatta Hospital Pharmacy',
    license: 'PH/2024/002',
    coordinates: [36.8058, -1.3006],
    address: 'Kenyatta National Hospital, Hospital Road',
    county: 'Nairobi',
    town: 'Nairobi',
    phone: '+254720123456',
    email: 'pharmacy@knh.or.ke',
    specialties: ['oncology', 'diabetes', 'hypertension', 'pediatrics', 'general'],
    is24Hours: true,
    services: ['prescription', 'consultation', 'insurance'],
    rating: 4.6
  },
  {
    name: 'Goodlife Pharmacy Westlands',
    license: 'PH/2024/003',
    coordinates: [36.8088, -1.2630],
    address: 'Westlands Shopping Centre, Westlands',
    county: 'Nairobi',
    town: 'Westlands',
    phone: '+254711234567',
    email: 'westlands@goodlife.co.ke',
    specialties: ['diabetes', 'hypertension', 'general'],
    services: ['prescription', 'consultation', 'delivery'],
    operatingHours: {
      monday: { open: '08:00', close: '21:00', closed: false },
      tuesday: { open: '08:00', close: '21:00', closed: false },
      wednesday: { open: '08:00', close: '21:00', closed: false },
      thursday: { open: '08:00', close: '21:00', closed: false },
      friday: { open: '08:00', close: '21:00', closed: false },
      saturday: { open: '08:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    rating: 4.5
  },
  {
    name: 'Mediplus Pharmacy Karen',
    license: 'PH/2024/004',
    coordinates: [36.6826, -1.3194],
    address: 'Karen Shopping Centre, Karen Road',
    county: 'Nairobi',
    town: 'Karen',
    phone: '+254722345678',
    email: 'karen@mediplus.co.ke',
    specialties: ['general', 'pediatrics'],
    services: ['prescription', 'delivery', 'vaccination'],
    rating: 4.3
  },
  {
    name: 'Alpha Pharmacy CBD',
    license: 'PH/2024/005',
    coordinates: [36.8219, -1.2865],
    address: 'Kimathi Street, CBD',
    county: 'Nairobi',
    town: 'Nairobi CBD',
    phone: '+254733456789',
    email: 'cbd@alphapharmacy.co.ke',
    specialties: ['general'],
    services: ['prescription', 'consultation'],
    rating: 4.1
  },
  {
    name: 'Mombasa Hospital Pharmacy',
    license: 'PH/2024/006',
    coordinates: [39.6682, -4.0435],
    address: 'Mombasa Hospital, Kenyatta Avenue',
    county: 'Mombasa',
    town: 'Mombasa',
    phone: '+254741567890',
    email: 'pharmacy@mombasahospital.com',
    specialties: ['oncology', 'diabetes', 'hypertension', 'general'],
    services: ['prescription', 'consultation', 'insurance'],
    rating: 4.4
  },
  {
    name: 'Kisumu Medical Center Pharmacy',
    license: 'PH/2024/007',
    coordinates: [34.7617, -0.0917],
    address: 'Kisumu Medical Center, Kakamega Road',
    county: 'Kisumu',
    town: 'Kisumu',
    phone: '+254752678901',
    email: 'pharmacy@kmc.co.ke',
    specialties: ['diabetes', 'hypertension', 'general'],
    services: ['prescription', 'consultation', 'delivery'],
    rating: 4.2
  },
  {
    name: 'Nakuru General Hospital Pharmacy',
    license: 'PH/2024/008',
    coordinates: [36.0667, -0.3031],
    address: 'Nakuru General Hospital, Hospital Road',
    county: 'Nakuru',
    town: 'Nakuru',
    phone: '+254763789012',
    email: 'pharmacy@nakuruhospital.go.ke',
    specialties: ['general', 'pediatrics'],
    services: ['prescription', 'consultation'],
    rating: 4.0
  },
  {
    name: 'Eldoret Regional Hospital Pharmacy',
    license: 'PH/2024/009',
    coordinates: [35.2699, 0.5143],
    address: 'Eldoret Regional Hospital, Uganda Road',
    county: 'Uasin Gishu',
    town: 'Eldoret',
    phone: '+254774890123',
    email: 'pharmacy@eldorethospital.go.ke',
    specialties: ['diabetes', 'hypertension', 'general'],
    services: ['prescription', 'consultation', 'insurance'],
    rating: 4.1
  },
  {
    name: 'Thika Level 5 Hospital Pharmacy',
    license: 'PH/2024/010',
    coordinates: [37.0693, -1.0332],
    address: 'Thika Level 5 Hospital, Hospital Road',
    county: 'Kiambu',
    town: 'Thika',
    phone: '+254785901234',
    email: 'pharmacy@thikahospital.go.ke',
    specialties: ['general', 'pediatrics'],
    services: ['prescription', 'consultation'],
    rating: 3.9
  }
];

const seedCompleteDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@medassist.co.ke',
        phone: '+254712345678',
        password: hashedPassword,
        role: 'user',
        location: {
          type: 'Point',
          coordinates: [36.8219, -1.2921]
        },
        address: 'Westlands, Nairobi'
      },
      {
        name: 'Pharmacy Manager',
        email: 'manager@medassist.co.ke',
        phone: '+254726013909',
        password: hashedPassword,
        role: 'pharmacy',
        location: {
          type: 'Point',
          coordinates: [36.8219, -1.2921]
        },
        address: 'Nairobi, Kenya'
      },
      {
        name: 'Dr. Sarah Wanjiku',
        email: 'doctor@medassist.co.ke',
        phone: '+254734567890',
        password: hashedPassword,
        role: 'doctor',
        location: {
          type: 'Point',
          coordinates: [36.8219, -1.2921]
        },
        address: 'Nairobi Hospital, Nairobi'
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create medicines
    console.log('💊 Creating medicines...');
    const medicines = await Medicine.insertMany(medicinesDatabase);
    console.log(`✅ Created ${medicines.length} medicines`);

    // Create pharmacies
    console.log('🏥 Creating pharmacies...');
    const pharmacyOwner = users[1];
    const pharmaciesData = kenyaPharmacies.map(pharmacy => ({
      owner: pharmacyOwner._id,
      name: pharmacy.name,
      license: pharmacy.license,
      location: {
        type: 'Point',
        coordinates: pharmacy.coordinates
      },
      address: pharmacy.address,
      county: pharmacy.county,
      town: pharmacy.town,
      phone: pharmacy.phone,
      email: pharmacy.email,
      operatingHours: pharmacy.operatingHours || {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      rating: pharmacy.rating || 4.0,
      totalReviews: Math.floor(Math.random() * 200) + 50,
      isVerified: true,
      isActive: true,
      is24Hours: pharmacy.is24Hours || false,
      services: pharmacy.services,
      specialties: pharmacy.specialties,
      deliveryRadius: 10,
      deliveryFee: 200
    }));

    const pharmacies = await Pharmacy.insertMany(pharmaciesData);
    console.log(`✅ Created ${pharmacies.length} pharmacies`);

    // Create inventory
    console.log('📦 Creating inventory...');
    const inventoryItems = [];
    
    for (const pharmacy of pharmacies) {
      for (const medicine of medicines) {
        // Ensure oncology medicines are only in specialized pharmacies
        if (medicine.therapeuticClass === 'oncology' && 
            !pharmacy.specialties.includes('oncology')) {
          continue;
        }

        // 85% chance pharmacy has general medicines, 60% for specialized
        const hasSpecialty = pharmacy.specialties.includes(medicine.therapeuticClass);
        const randomChance = hasSpecialty ? 0.85 : 0.60;
        
        if (Math.random() < randomChance) {
          const basePrice = getBasePriceByCategory(medicine.therapeuticClass);
          const priceVariation = (Math.random() * 0.4 - 0.2);
          const price = Math.round(basePrice * (1 + priceVariation));
          
          const quantity = medicine.therapeuticClass === 'oncology' ? 
            Math.floor(Math.random() * 20) + 5 :
            Math.floor(Math.random() * 100) + 10;
          
          inventoryItems.push({
            pharmacy: pharmacy._id,
            medicine: medicine._id,
            quantity: quantity,
            price: Math.max(10, price),
            discountPrice: Math.random() > 0.7 ? Math.round(price * 0.9) : undefined,
            minQuantityAlert: medicine.therapeuticClass === 'oncology' ? 5 : 15,
            maxQuantityPerCustomer: medicine.isControlled ? 30 : 100,
            expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)),
            batchNumber: `B${Math.floor(Math.random() * 100000)}`
          });
        }
      }
    }

    await Inventory.insertMany(inventoryItems);
    console.log(`✅ Created ${inventoryItems.length} inventory items`);

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`💊 Medicines: ${medicines.length}`);
    console.log(`🏥 Pharmacies: ${pharmacies.length}`);
    console.log(`📦 Inventory Items: ${inventoryItems.length}`);

    console.log('\n🔐 Test Accounts:');
    console.log('1. Regular User: john@medassist.co.ke / password123');
    console.log('2. Pharmacy Manager: manager@medassist.co.ke / password123');
    console.log('3. Doctor: doctor@medassist.co.ke / password123');

    console.log('\n💊 Medicine Categories Created:');
    console.log('🎗️  Oncology: 3 medicines (Methotrexate, Tamoxifen, Cyclophosphamide)');
    console.log('🍯 Diabetes: 3 medicines (Metformin, Insulin, Gliclazide)');
    console.log('❤️  Hypertension: 3 medicines (Amlodipine, Lisinopril, HCTZ)');
    console.log('💊 Daily Use: 15+ medicines (Paracetamol, Ibuprofen, etc.)');

    console.log('\n🏥 Pharmacies by Location:');
    pharmacies.forEach((pharmacy, index) => {
      console.log(`${index + 1}. ${pharmacy.name} - ${pharmacy.county}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

function getBasePriceByCategory(category) {
  const prices = {
    'oncology': 5000,
    'diabetes': 800,
    'hypertension': 600,
    'antibiotics': 300,
    'painkillers': 50,
    'vitamins': 200,
    'general': 100,
    'respiratory': 150,
    'gastro': 400,
    'cardiovascular': 700
  };
  return prices[category] || 100;
}

seedCompleteDatabase();