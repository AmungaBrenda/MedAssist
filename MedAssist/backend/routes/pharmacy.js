const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  getPharmacyInventory
} = require('../controllers/pharmacyController');

router.get('/nearby', getNearbyPharmacies);
router.get('/:id', getPharmacy);
router.get('/:id/inventory', getPharmacyInventory);
router.post('/', protect, createPharmacy);
router.put('/:id', protect, updatePharmacy);

module.exports = router;