import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Payment, CheckCircle } from '@mui/icons-material';
import { paymentService } from '../../services/paymentService';

const MpesaPayment = ({ open, onClose, subscriptionType, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [error, setError] = useState('');

  const subscriptionPlans = {
    basic: {
      name: 'Basic Plan',
      price: 500,
      features: ['Medicine search', 'Basic pharmacy finder', 'Price comparison']
    },
    premium: {
      name: 'Premium Plan',
      price: 1000,
      features: ['All Basic features', 'Advanced search filters', 'Stock alerts', 'Telemedicine access', 'Priority support']
    }
  };

  const plan = subscriptionPlans[subscriptionType];

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    setLoading(true);
    setError('');

    try {
      const response = await paymentService.initiatePayment({
        phoneNumber: formattedPhone,
        amount: plan.price,
        accountReference: `MedAssist ${plan.name}`,
        transactionDesc: `Payment for ${plan.name} subscription`
      });

      if (response.success) {
        setCheckoutRequestId(response.checkoutRequestId);
        setPaymentStatus('initiated');
        
        // Start polling for payment status
        pollPaymentStatus(response.checkoutRequestId);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (requestId) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await paymentService.queryPayment({ checkoutRequestId: requestId });
        
        if (response.data.ResultCode === '0') {
          // Payment successful
          setPaymentStatus('success');
          if (onSuccess) {
            onSuccess();
          }
          return;
        } else if (response.data.ResultCode !== '1032') {
          // Payment failed (not pending)
          setPaymentStatus('failed');
          setError(response.data.ResultDesc || 'Payment failed');
          return;
        }

        // Payment still pending
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('timeout');
          setError('Payment verification timed out. Please check your M-Pesa messages.');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };

    poll();
  };

  const handleClose = () => {
    setPhoneNumber('');
    setLoading(false);
    setCheckoutRequestId('');
    setPaymentStatus('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Payment sx={{ mr: 1 }} />
          Subscribe to {plan?.name}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {plan && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {plan.name}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                KES {plan.price.toLocaleString()}
                <Typography component="span" variant="body2" color="text.secondary">
                  /month
                </Typography>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Features included:
              </Typography>
              {plan.features.map((feature, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  • {feature}
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {paymentStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
            Payment successful! Your subscription has been activated.
          </Alert>
        )}

        {paymentStatus === 'initiated' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Payment request sent to your phone. Please check your M-Pesa messages and enter your PIN to complete the payment.
          </Alert>
        )}

        {!paymentStatus && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your M-Pesa registered phone number to subscribe
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678 or 254712345678"
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Typography variant="caption" color="text.secondary">
              You will receive an M-Pesa prompt on your phone to complete the payment
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {paymentStatus === 'success' ? 'Close' : 'Cancel'}
        </Button>
        {!paymentStatus && (
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={loading || !phoneNumber}
            startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
          >
            {loading ? 'Processing...' : `Pay KES ${plan?.price.toLocaleString()}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MpesaPayment;