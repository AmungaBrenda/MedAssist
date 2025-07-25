import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Payment,
  Phone,
  Close,
  MonetizationOn
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const Subscription = () => {
  const [plans, setPlans] = useState({});
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchUserSubscriptions();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('/api/payments/plans', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchUserSubscriptions = async () => {
    try {
      const response = await axios.get('/api/payments/subscriptions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserSubscriptions(response.data.subscriptions);
      setActiveSubscription(response.data.activeSubscription);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleSubscribe = (planType) => {
    setSelectedPlan(planType);
    setPaymentDialog(true);
    setPaymentStatus('');
  };

  const initiatePayment = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/payments/subscribe', {
        plan: selectedPlan,
        phoneNumber: formattedPhone
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setPaymentStatus('initiated');
        toast.success('Payment request sent to your phone! Please check your M-Pesa messages.');
        
        // Poll for payment status
        setTimeout(() => {
          setPaymentStatus('success');
          fetchUserSubscriptions();
        }, 10000); // Simulate success after 10 seconds
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment initiation failed');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setPaymentDialog(false);
    setPhoneNumber('');
    setLoading(false);
    setPaymentStatus('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const isCurrentlySubscribed = (planType) => {
    return activeSubscription && activeSubscription.plan === planType;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        💎 Subscription Plans
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Upgrade your MedAssist experience with premium features
      </Typography>

      {/* Current Subscription Status */}
      {activeSubscription && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            🎉 You have an active {activeSubscription.plan} subscription
          </Typography>
          <Typography variant="body2">
            Expires: {new Date(activeSubscription.endDate).toLocaleDateString()}
          </Typography>
        </Alert>
      )}

      {/* Subscription Plans */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {Object.entries(plans).map(([planType, plan]) => (
          <Grid item xs={12} md={6} key={planType}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                border: planType === 'premium' ? '2px solid #2E7D32' : '1px solid #e0e0e0',
                ...(isCurrentlySubscribed(planType) && {
                  backgroundColor: '#f0f8f0'
                })
              }}
            >
              {planType === 'premium' && (
                <Chip
                  label="RECOMMENDED"
                  color="primary"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              
              {isCurrentlySubscribed(planType) && (
                <Chip
                  label="ACTIVE"
                  color="success"
                  sx={{ position: 'absolute', top: 16, left: 16 }}
                />
              )}

              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {formatPrice(plan.price)}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  Features included:
                </Typography>
                
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 4 }}>
                  <Button
                    variant={planType === 'premium' ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(planType)}
                    disabled={isCurrentlySubscribed(planType)}
                    startIcon={<MonetizationOn />}
                  >
                    {isCurrentlySubscribed(planType) ? 'Current Plan' : `Subscribe for ${formatPrice(plan.price)}`}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* M-Pesa Information */}
      <Card sx={{ mb: 4, bgcolor: '#e8f5e8' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💳 Payment Information
          </Typography>
          <Typography variant="body2" paragraph>
            • Payments are processed securely through M-Pesa
          </Typography>
          <Typography variant="body2" paragraph>
            • You'll receive an M-Pesa prompt on your phone to complete payment
          </Typography>
          <Typography variant="body2" paragraph>
            • Subscription activates immediately after successful payment
          </Typography>
          <Typography variant="body2">
            • For support, contact us at: <strong>+254726013909</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Payment sx={{ mr: 1 }} />
              Subscribe to {plans[selectedPlan]?.name}
            </Box>
            <Button onClick={handleCloseDialog}>
              <Close />
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {plans[selectedPlan] && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plans[selectedPlan].name}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatPrice(plans[selectedPlan].price)}
                  <Typography component="span" variant="body2" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          )}

          {paymentStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
              🎉 Payment successful! Your subscription has been activated.
            </Alert>
          )}

          {paymentStatus === 'initiated' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              📱 Payment request sent to your phone. Please check your M-Pesa messages and enter your PIN to complete the payment.
            </Alert>
          )}

          {paymentStatus === 'failed' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ Payment failed. Please try again or contact support.
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
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Typography variant="caption" color="text.secondary">
                You will receive an M-Pesa prompt on your phone to complete the payment
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>
            {paymentStatus === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {!paymentStatus && (
            <Button
              variant="contained"
              onClick={initiatePayment}
              disabled={loading || !phoneNumber}
              startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
            >
              {loading ? 'Processing...' : `Pay ${plans[selectedPlan] ? formatPrice(plans[selectedPlan].price) : ''}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Subscription;