const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  searchMedicines,
  getMedicine,
  getCategories,
  createMedicine,
  getTrendingMedicines
} = require('../controllers/medicineController');

router.get('/search', searchMedicines);
router.get('/categories', getCategories);
router.get('/trending', getTrendingMedicines);
router.get('/:id', getMedicine);
router.post('/', protect, authorize('pharmacy', 'admin'), createMedicine);

module.exports = router;