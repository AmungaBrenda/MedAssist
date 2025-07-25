const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

exports.getNearbyPharmacies = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10000, 
      specialty,
      is24Hours,
      services,
      page = 1,
      limit = 20
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    let pipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: 'distance',
          maxDistance: parseInt(radius),
          spherical: true,
          query: {
            isActive: true,
            isVerified: true
          }
        }
      }
    ];

    let matchConditions = {};
    if (specialty) matchConditions.specialties = { $in: [specialty] };
    if (is24Hours === 'true') matchConditions.is24Hours = true;
    if (services) {
      const serviceArray = services.split(',');
      matchConditions.services = { $in: serviceArray };
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const pharmacies = await Pharmacy.aggregate(pipeline);

    const pharmaciesWithStatus = pharmacies.map(pharmacy => ({
      ...pharmacy,
      isCurrentlyOpen: checkPharmacyOpen(pharmacy.operatingHours, pharmacy.is24Hours)
    }));

    res.status(200).json({
      success: true,
      count: pharmaciesWithStatus.length,
      pharmacies: pharmaciesWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

function checkPharmacyOpen(operatingHours, is24Hours) {
  if (is24Hours) return true;
  
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  
  const todayHours = operatingHours[today];
  if (todayHours.closed) return false;
  
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const openTime = parseInt(todayHours.open.replace(':', ''));
  const closeTime = parseInt(todayHours.close.replace(':', ''));
  
  return currentTime >= openTime && currentTime <= closeTime;
}

exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    const topMedicines = await Inventory.find({ 
      pharmacy: req.params.id,
      status: 'available'
    })
    .populate('medicine', 'name brand category therapeuticClass')
    .sort({ quantity: -1 })
    .limit(10);

    res.status(200).json({
      success: true,
      pharmacy: {
        ...pharmacy.toObject(),
        isCurrentlyOpen: checkPharmacyOpen(pharmacy.operatingHours, pharmacy.is24Hours)
      },
      topMedicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createPharmacy = async (req, res) => {
  try {
    const {
      name,
      license,
      location,
      address,
      county,
      town,
      phone,
      email,
      operatingHours,
      services,
      specialties
    } = req.body;

    const existingPharmacy = await Pharmacy.findOne({ license });
    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy with this license already exists'
      });
    }

    const pharmacy = await Pharmacy.create({
      owner: req.user.id,
      name,
      license,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      address,
      county,
      town,
      phone,
      email,
      operatingHours,
      services,
      specialties
    });

    await User.findByIdAndUpdate(req.user.id, { role: 'pharmacy' });

    res.status(201).json({
      success: true,
      message: 'Pharmacy created successfully',
      pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePharmacy = async (req, res) => {
  try {
    let pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    if (pharmacy.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pharmacy'
      });
    }

    const updateData = { ...req.body };

    if (req.body.location) {
      updateData.location = {
        type: 'Point',
        coordinates: [req.body.location.longitude, req.body.location.latitude]
      };
    }

    pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Pharmacy updated successfully',
      pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPharmacyInventory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, therapeuticClass } = req.query;

    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    let query = { pharmacy: req.params.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    let pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine',
          foreignField: '_id',
          as: 'medicineDetails'
        }
      },
      { $unwind: '$medicineDetails' }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'medicineDetails.name': { $regex: search, $options: 'i' } },
            { 'medicineDetails.genericName': { $regex: search, $options: 'i' } },
            { 'medicineDetails.brand': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    if (therapeuticClass) {
      pipeline.push({
        $match: { 'medicineDetails.therapeuticClass': therapeuticClass }
      });
    }

    pipeline.push(
      { $sort: { 'medicineDetails.name': 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const inventory = await Inventory.aggregate(pipeline);

    const totalPipeline = [...pipeline.slice(0, -2)];
    totalPipeline.push({ $count: 'total' });
    const totalResult = await Inventory.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};