const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medassist')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🏥 MedAssist API Server',
    status: 'Running',
    timestamp: new Date().toISOString(),
    features: [
      '💊 50+ Medicines (Oncology, Diabetes, Daily use)',
      '🏥 10+ Pharmacies across Kenya',
      '💳 M-Pesa Payment Integration',
      '🗺️ Location-based Search',
      '📱 Mobile Responsive'
    ]
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

// Routes - with error handling
try {
  // Check if route files exist before requiring them
  const fs = require('fs');
  const path = require('path');
  
  const routeFiles = [
    './routes/auth.js',
    './routes/medicine.js', 
    './routes/pharmacy.js',
    './routes/payment.js'
  ];
  
  routeFiles.forEach(routeFile => {
    const fullPath = path.resolve(__dirname, routeFile);
    if (fs.existsSync(fullPath)) {
      try {
        const route = require(routeFile);
        const routeName = routeFile.split('/').pop().replace('.js', '');
        app.use(`/api/${routeName === 'auth' ? 'auth' : 
                      routeName === 'medicine' ? 'medicines' :
                      routeName === 'pharmacy' ? 'pharmacies' :
                      routeName === 'payment' ? 'payments' : routeName}`, route);
        console.log(`✅ ${routeName} routes loaded`);
      } catch (err) {
        console.log(`⚠️ Error loading ${routeFile}:`, err.message);
      }
    } else {
      console.log(`⚠️ Route file not found: ${routeFile}`);
    }
  });
  
} catch (error) {
  console.log('⚠️ Routes loading error:', error.message);
  console.log('📝 Server running without custom routes - basic functionality available');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/medicines/search',
      'GET /api/pharmacies/nearby'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 =================================');
  console.log(`🚀 MedAssist Server Started`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Base URL: http://localhost:${PORT}`);
  console.log('🚀 =================================\n');
  
  console.log('📋 Available Endpoints:');
  console.log(`   🏠 Home: http://localhost:${PORT}/`);
  console.log(`   🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth/*`);
  console.log(`   💊 Medicines: http://localhost:${PORT}/api/medicines/*`);
  console.log(`   🏥 Pharmacies: http://localhost:${PORT}/api/pharmacies/*`);
  console.log(`   💳 Payments: http://localhost:${PORT}/api/payments/*\n`);
  
  console.log('🎯 Next Steps:');
  console.log('   1. Visit http://localhost:5000 to test API');
  console.log('   2. Run "npm run seed" to populate database');
  console.log('   3. Start frontend with "npm start"\n');
});