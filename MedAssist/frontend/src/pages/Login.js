// Login.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful!');
        navigate('/');
        window.location.reload(); // Refresh to update navbar
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick login for demo
  const quickLogin = async (userType) => {
    const credentials = {
      user: { email: 'john@medassist.co.ke', password: 'password123' },
      pharmacy: { email: 'manager@medassist.co.ke', password: 'password123' },
      doctor: { email: 'doctor@medassist.co.ke', password: 'password123' }
    };

    setFormData(credentials[userType]);
    // Auto-submit after setting credentials
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🏥 Welcome Back
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to your MedAssist account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>

        {/* Demo Accounts */}
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fffe', borderRadius: 2 }}>
          <Typography variant="subtitle2" align="center" gutterBottom>
            🎯 Demo Accounts (Quick Login)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Button size="small" onClick={() => quickLogin('user')}>
              👤 Regular User
            </Button>
            <Button size="small" onClick={() => quickLogin('pharmacy')}>
              🏥 Pharmacy Manager
            </Button>
            <Button size="small" onClick={() => quickLogin('doctor')}>
              👨‍⚕️ Doctor
            </Button>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ textDecoration: 'none' }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;