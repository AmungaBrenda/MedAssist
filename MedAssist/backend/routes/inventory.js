const express = require('express');
const router = express.Router();

const {
  updateInventory,
  getInventory,
  deleteInventoryItem,
  getLowStockAlerts
} = require('../controllers/inventoryController');

const { protect, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Inventory routes working' });
});

// All routes require pharmacy role
router.use(protect);
router.use(authorize('pharmacy'));

router.get('/', getInventory);
router.get('/alerts', getLowStockAlerts);
router.post('/', updateInventory);
router.delete('/:id', deleteInventoryItem);

module.exports = router;