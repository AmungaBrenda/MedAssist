// Updated Footer.js - Remove unused LinkedIn import
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  LocalPharmacy,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  WhatsApp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Search Medicines', path: '/search' },
    { name: 'Find Pharmacies', path: '/map' },
    { name: 'Subscription Plans', path: '/subscription' },
    { name: 'About Us', path: '/about' },
  ];

  const medicineCategories = [
    { name: '🎗️ Oncology', path: '/search?therapeuticClass=oncology' },
    { name: '🍯 Diabetes', path: '/search?therapeuticClass=diabetes' },
    { name: '❤️ Hypertension', path: '/search?therapeuticClass=hypertension' },
    { name: '💊 Pain Relief', path: '/search?therapeuticClass=painkillers' },
    { name: '🌟 Vitamins', path: '/search?therapeuticClass=vitamins' },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1f2937',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalPharmacy sx={{ fontSize: 32, mr: 1, color: '#10b981' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  MedAssist
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 3, color: '#d1d5db' }}>
                Your trusted partner for finding medicines across Kenya. 
                Search, compare, and locate medicines with ease from verified pharmacies.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ fontSize: 16, mr: 1, color: '#10b981' }} />
                  <Typography variant="body2" color="#d1d5db">
                    +254726013909
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ fontSize: 16, mr: 1, color: '#10b981' }} />
                  <Typography variant="body2" color="#d1d5db">
                    support@medassist.co.ke
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ fontSize: 16, mr: 1, color: '#10b981' }} />
                  <Typography variant="body2" color="#d1d5db">
                    Nairobi, Kenya
                  </Typography>
                </Box>
              </Box>

              {/* Social Media */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#10b981' }}>
                  Follow Us
                </Typography>
                <Box>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#d1d5db', '&:hover': { color: '#10b981' } }}
                    href="https://facebook.com/medassistkenya" 
                    target="_blank"
                  >
                    <Facebook />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#d1d5db', '&:hover': { color: '#10b981' } }}
                    href="https://twitter.com/medassistke" 
                    target="_blank"
                  >
                    <Twitter />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#d1d5db', '&:hover': { color: '#10b981' } }}
                    href="https://instagram.com/medassistkenya" 
                    target="_blank"
                  >
                    <Instagram />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#d1d5db', '&:hover': { color: '#10b981' } }}
                    href="https://wa.me/254726013909" 
                    target="_blank"
                  >
                    <WhatsApp />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="nav">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  component="button"
                  variant="body2"
                  onClick={() => handleLinkClick(link.path)}
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: '#d1d5db',
                    textDecoration: 'none',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    '&:hover': {
                      color: '#10b981',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Medicine Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 'bold' }}>
              Medicine Categories
            </Typography>
            <Box component="nav">
              {medicineCategories.map((category) => (
                <Link
                  key={category.name}
                  component="button"
                  variant="body2"
                  onClick={() => handleLinkClick(category.path)}
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: '#d1d5db',
                    textDecoration: 'none',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    '&:hover': {
                      color: '#10b981',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Stats & Features */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 'bold' }}>
              Platform Stats
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="#d1d5db">Medicines:</Typography>
                <Chip label="50+" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="#d1d5db">Pharmacies:</Typography>
                <Chip label="10+" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="#d1d5db">Counties:</Typography>
                <Chip label="6+" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="#d1d5db">24/7 Access:</Typography>
                <Chip label="Yes" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, color: '#10b981' }}>
              Key Features
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {[
                'Real-time Search',
                'Price Comparison', 
                'Location-based',
                'M-Pesa Payments',
                'Verified Pharmacies',
                'Mobile Friendly'
              ].map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    color: '#d1d5db', 
                    borderColor: '#374151',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#374151' }} />

        {/* Bottom Footer */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="#9ca3af">
              © {currentYear} MedAssist Kenya. All rights reserved.
            </Typography>
            <Typography variant="caption" color="#6b7280" sx={{ display: 'block', mt: 0.5 }}>
              Licensed by the Pharmacy and Poisons Board of Kenya
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              gap: 2,
              flexWrap: 'wrap'
            }}>
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#10b981' }
                }}
              >
                Privacy Policy
              </Link>
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#10b981' }
                }}
              >
                Terms of Service
              </Link>
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#10b981' }
                }}
              >
                Contact Us
              </Link>
              <Link
                component="button"
                variant="caption"
                sx={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  '&:hover': { color: '#10b981' }
                }}
              >
                Help
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Emergency Notice */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: '#374151',
            borderRadius: 2,
            border: '1px solid #4b5563',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 'bold', mb: 0.5 }}>
            🚨 Medical Emergency?
          </Typography>
          <Typography variant="caption" color="#d1d5db">
            For life-threatening emergencies, call 999 or visit the nearest hospital immediately. 
            MedAssist is for medicine information only and does not replace professional medical advice.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;