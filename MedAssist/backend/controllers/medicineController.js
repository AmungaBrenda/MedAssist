const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

exports.searchMedicines = async (req, res) => {
  try {
    const {
      search,
      latitude,
      longitude,
      radius = 20000,
      category,
      therapeuticClass,
      requiresPrescription,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    let medicineQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { activeIngredients: { $in: [new RegExp(search, 'i')] } }
      ]
    };

    if (category) medicineQuery.category = category;
    if (therapeuticClass) medicineQuery.therapeuticClass = therapeuticClass;
    if (requiresPrescription !== undefined) medicineQuery.requiresPrescription = requiresPrescription === 'true';

    const medicines = await Medicine.find(medicineQuery);
    const medicineIds = medicines.map(med => med._id);

    if (medicineIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No medicines found',
        results: [],
        total: 0
      });
    }

    let pipeline = [
      {
        $match: {
          medicine: { $in: medicineIds },
          status: { $ne: 'out_of_stock' }
        }
      }
    ];

    if (minPrice || maxPrice) {
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = parseInt(minPrice);
      if (maxPrice) priceMatch.$lte = parseInt(maxPrice);
      pipeline.push({ $match: { price: priceMatch } });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'medicines',
          localField: 'medicine',
          foreignField: '_id',
          as: 'medicineDetails'
        }
      },
      {
        $lookup: {
          from: 'pharmacies',
          localField: 'pharmacy',
          foreignField: '_id',
          as: 'pharmacyDetails'
        }
      },
      { $unwind: '$medicineDetails' },
      { $unwind: '$pharmacyDetails' },
      {
        $match: {
          'pharmacyDetails.isActive': true,
          'pharmacyDetails.isVerified': true
        }
      }
    );

    if (latitude && longitude) {
      pipeline.unshift({
        $lookup: {
          from: 'pharmacies',
          let: { pharmacyId: '$pharmacy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$pharmacyId'] } } },
            {
              $geoNear: {
                near: {
                  type: 'Point',
                  coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                distanceField: 'distance',
                maxDistance: parseInt(radius),
                spherical: true,
                query: { isActive: true, isVerified: true }
              }
            }
          ],
          as: 'nearbyPharmacy'
        }
      });
      
      pipeline.push(
        { $match: { nearbyPharmacy: { $ne: [] } } },
        { $addFields: { distance: { $arrayElemAt: ['$nearbyPharmacy.distance', 0] } } }
      );
    }

    pipeline.push(
      {
        $project: {
          medicine: '$medicineDetails',
          pharmacy: {
            id: '$pharmacyDetails._id',
            name: '$pharmacyDetails.name',
            address: '$pharmacyDetails.address',
            phone: '$pharmacyDetails.phone',
            location: '$pharmacyDetails.location',
            rating: '$pharmacyDetails.rating',
            operatingHours: '$pharmacyDetails.operatingHours',
            services: '$pharmacyDetails.services',
            is24Hours: '$pharmacyDetails.is24Hours'
          },
          quantity: 1,
          price: 1,
          discountPrice: 1,
          status: 1,
          distance: 1
        }
      },
      {
        $sort: latitude && longitude ? { distance: 1, price: 1 } : { price: 1 }
      }
    );

    const results = await Inventory.aggregate(pipeline);

    const groupedResults = {};
    results.forEach(item => {
      const medicineId = item.medicine._id.toString();
      if (!groupedResults[medicineId]) {
        groupedResults[medicineId] = {
          medicine: item.medicine,
          availability: []
        };
      }

      const isOpen = checkPharmacyOpen(item.pharmacy.operatingHours, item.pharmacy.is24Hours);
      
      groupedResults[medicineId].availability.push({
        pharmacy: {
          ...item.pharmacy,
          isCurrentlyOpen: isOpen
        },
        quantity: item.quantity,
        price: item.price,
        discountPrice: item.discountPrice,
        status: item.status,
        distance: item.distance
      });
    });

    const finalResults = Object.values(groupedResults);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = finalResults.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedResults.length,
      total: finalResults.length,
      pages: Math.ceil(finalResults.length / limit),
      currentPage: parseInt(page),
      results: paginatedResults
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

exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    const availability = await Inventory.find({ medicine: req.params.id })
      .populate('pharmacy', 'name address phone location rating operatingHours services is24Hours')
      .where('status').ne('out_of_stock');

    res.status(200).json({
      success: true,
      medicine,
      availability: availability.map(item => ({
        ...item.toObject(),
        pharmacy: {
          ...item.pharmacy.toObject(),
          isCurrentlyOpen: checkPharmacyOpen(item.pharmacy.operatingHours, item.pharmacy.is24Hours)
        }
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    const therapeuticClasses = await Medicine.distinct('therapeuticClass');
    
    res.status(200).json({
      success: true,
      categories,
      therapeuticClasses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTrendingMedicines = async (req, res) => {
  try {
    const trending = await Inventory.aggregate([
      { $match: { status: 'available' } },
      { 
        $group: { 
          _id: '$medicine', 
          totalQuantity: { $sum: '$quantity' },
          pharmacyCount: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        } 
      },
      { $sort: { pharmacyCount: -1, totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' }
    ]);

    res.status(200).json({
      success: true,
      trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};