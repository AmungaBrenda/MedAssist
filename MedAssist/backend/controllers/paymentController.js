const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  businessPhone: '+254726013909'
};

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 500,
    duration: 30,
    features: [
      'Unlimited medicine search',
      'Price comparison',
      'Basic pharmacy finder',
      'SMS alerts',
      'Email support'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 1000,
    duration: 30,
    features: [
      'All Basic features',
      'Advanced search filters',
      'Priority pharmacy listings',
      'Stock alerts',
      'Telemedicine access',
      'Priority support',
      'Delivery tracking'
    ]
  }
};

const getMpesaAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa access token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

const generatePassword = (timestamp) => {
  const data = MPESA_CONFIG.businessShortCode + MPESA_CONFIG.passkey + timestamp;
  return Buffer.from(data).toString('base64');
};

exports.getSubscriptionPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.initiateSubscription = async (req, res) => {
  try {
    const { plan, phoneNumber } = req.body;

    if (!SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    let phone = phoneNumber.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '254' + phone.substring(1);
    } else if (!phone.startsWith('254')) {
      phone = '254' + phone;
    }

    if (!/^254[0-9]{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use 254XXXXXXXXX'
      });
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan];

    const subscription = await Subscription.create({
      user: req.user.id,
      plan: plan,
      amount: selectedPlan.price,
      endDate: new Date(Date.now() + (selectedPlan.duration * 24 * 60 * 60 * 1000)),
      status: 'pending',
      mpesaDetails: {
        phoneNumber: phone
      }
    });

    const accessToken = await getMpesaAccessToken();
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = generatePassword(timestamp);

    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: selectedPlan.price,
      PartyA: phone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: phone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: `MedAssist-${plan.toUpperCase()}-${req.user.id}`,
      TransactionDesc: `MedAssist ${selectedPlan.name} Subscription`
    };

    const response = await axios.post(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      await Subscription.findByIdAndUpdate(subscription._id, {
        'mpesaDetails.checkoutRequestId': response.data.CheckoutRequestID
      });

      res.status(200).json({
        success: true,
        message: 'Payment request sent to your phone',
        subscriptionId: subscription._id,
        checkoutRequestId: response.data.CheckoutRequestID,
        plan: selectedPlan
      });
    } else {
      await Subscription.findByIdAndUpdate(subscription._id, { status: 'failed' });
      
      res.status(400).json({
        success: false,
        message: response.data.ResponseDescription || 'Payment request failed'
      });
    }
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed'
    });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    
    if (Body.stkCallback.ResultCode === 0) {
      const callbackMetadata = Body.stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;
      
      const paymentData = {
        merchantRequestId: Body.stkCallback.MerchantRequestID,
        checkoutRequestId: Body.stkCallback.CheckoutRequestID,
        amount: items.find(item => item.Name === 'Amount')?.Value || 0,
        mpesaReceiptNumber: items.find(item => item.Name === 'MpesaReceiptNumber')?.Value || '',
        transactionDate: items.find(item => item.Name === 'TransactionDate')?.Value || new Date(),
        phoneNumber: items.find(item => item.Name === 'PhoneNumber')?.Value || ''
      };

      await processSuccessfulPayment(paymentData);
      
      console.log('✅ Payment processed successfully:', paymentData);
    } else {
      console.log('❌ Payment failed:', Body.stkCallback.ResultDesc);
      
      await Subscription.updateOne(
        { 'mpesaDetails.checkoutRequestId': Body.stkCallback.CheckoutRequestID },
        { status: 'failed' }
      );
    }

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  }
};

const processSuccessfulPayment = async (paymentData) => {
  try {
    const subscription = await Subscription.findOne({
      'mpesaDetails.checkoutRequestId': paymentData.checkoutRequestId
    }).populate('user');

    if (subscription) {
      await Subscription.findByIdAndUpdate(subscription._id, {
        status: 'active',
        'mpesaDetails.mpesaReceiptNumber': paymentData.mpesaReceiptNumber,
        'mpesaDetails.transactionDate': new Date(paymentData.transactionDate.toString())
      });

      const endDate = new Date(Date.now() + (SUBSCRIPTION_PLANS[subscription.plan].duration * 24 * 60 * 60 * 1000));
      
      await User.findByIdAndUpdate(subscription.user._id, {
        subscription: subscription.plan,
        subscriptionExpiry: endDate,
        $push: {
          subscriptionHistory: {
            plan: subscription.plan,
            amount: subscription.amount,
            startDate: new Date(),
            endDate: endDate,
            mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
            status: 'active'
          }
        }
      });

      console.log(`✅ User ${subscription.user._id} upgraded to ${subscription.plan} plan`);
    }
  } catch (error) {
    console.error('Error processing payment:', error);
  }
};

exports.queryPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = generatePassword(timestamp);

    const queryData = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await axios.post(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/stkpushquery/v1/query`,
      queryData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const subscription = await Subscription.findOne({
      'mpesaDetails.checkoutRequestId': checkoutRequestId
    });

    res.status(200).json({
      success: true,
      mpesaResponse: response.data,
      subscriptionStatus: subscription?.status || 'not_found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Query failed',
      error: error.message
    });
  }
};

exports.getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const activeSubscription = subscriptions.find(sub => 
      sub.status === 'active' && sub.endDate > new Date()
    );

    res.status(200).json({
      success: true,
      subscriptions,
      activeSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'cancelled',
      autoRenew: false
    });

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully. Access will continue until expiry date.',
      expiryDate: subscription.endDate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};