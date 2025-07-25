const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSubscriptionPlans,
  initiateSubscription,
  mpesaCallback,
  queryPaymentStatus,
  getUserSubscriptions,
  cancelSubscription
} = require('../controllers/paymentController');

router.get('/plans', protect, getSubscriptionPlans);
router.post('/subscribe', protect, initiateSubscription);
router.post('/callback', mpesaCallback);
router.post('/query', protect, queryPaymentStatus);
router.get('/subscriptions', protect, getUserSubscriptions);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;