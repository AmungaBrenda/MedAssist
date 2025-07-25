import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Fade,
  Slide
} from '@mui/material';
import {
  Search,
  LocalPharmacy,
  LocationOn,
  AccessTime,
  TrendingUp,
  Security,
  Speed,
  Phone,
  Email,
  CheckCircle,
  ArrowForward,
  LocalHospital,
  Favorite,
  Schedule,
  Place
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          fetchNearbyPharmacies(location);
        },
        () => {
          // Default to Nairobi if location denied
          const defaultLocation = { latitude: -1.2921, longitude: 36.8219 };
          setUserLocation(defaultLocation);
          fetchNearbyPharmacies(defaultLocation);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Trigger stats animation after component mounts
    setTimeout(() => setStatsVisible(true), 500);
    
    // Get user location
    getUserLocation();
    
    // Fetch featured content
    fetchFeaturedMedicines();
  }, [getUserLocation]);

  const fetchFeaturedMedicines = async () => {
    try {
      const response = await axios.get('/api/medicines/trending');
      setFeaturedMedicines(response.data.trending?.slice(0, 6) || []);
    } catch (error) {
      console.error('Error fetching featured medicines:', error);
      // Set mock data for demo
      setFeaturedMedicines([
        {
          medicine: { 
            name: 'Paracetamol', 
            category: 'tablet', 
            therapeuticClass: 'painkillers',
            description: 'Pain reliever and fever reducer'
          },
          pharmacyCount: 8,
          avgPrice: 45
        },
        {
          medicine: { 
            name: 'Metformin', 
            category: 'tablet', 
            therapeuticClass: 'diabetes',
            description: 'Type 2 diabetes medication'
          },
          pharmacyCount: 6,
          avgPrice: 850
        },
        {
          medicine: { 
            name: 'Amlodipine', 
            category: 'tablet', 
            therapeuticClass: 'hypertension',
            description: 'Blood pressure medication'
          },
          pharmacyCount: 7,
          avgPrice: 520
        }
      ]);
    }
  };

  const fetchNearbyPharmacies = async (location) => {
    try {
      const response = await axios.get('/api/pharmacies/nearby', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          limit: 4
        }
      });
      setNearbyPharmacies(response.data.pharmacies || []);
    } catch (error) {
      console.error('Error fetching nearby pharmacies:', error);
      // Set mock data for demo
      setNearbyPharmacies([
        {
          name: 'Nairobi Hospital Pharmacy',
          address: 'Argwings Kodhek Road, Nairobi',
          rating: 4.8,
          distance: 1200,
          isCurrentlyOpen: true,
          phone: '+254726013909',
          services: ['prescription', 'consultation', 'delivery'],
          specialties: ['oncology', 'diabetes']
        },
        {
          name: 'Goodlife Pharmacy Westlands',
          address: 'Westlands Shopping Centre',
          rating: 4.5,
          distance: 2100,
          isCurrentlyOpen: true,
          phone: '+254711234567',
          services: ['prescription', 'delivery'],
          specialties: ['general']
        }
      ]);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickSearch.trim()) {
      toast.error('Please enter a medicine name');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(quickSearch)}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getTherapeuticIcon = (therapeuticClass) => {
    const icons = {
      'oncology': '🎗️',
      'diabetes': '🍯',
      'hypertension': '❤️',
      'painkillers': '🩹',
      'antibiotics': '💊',
      'vitamins': '🌟',
      'general': '💊'
    };
    return icons[therapeuticClass] || '💊';
  };

  return (
    <Box sx={{ bgcolor: '#f8fffe', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={true} timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      mb: 2
                    }}
                  >
                    Find Your Medicine
                    <Box component="span" sx={{ color: '#10b981', display: 'block' }}>
                      Instantly 🏥
                    </Box>
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      fontSize: { xs: '1.1rem', md: '1.3rem' }
                    }}
                  >
                    Search 50+ medicines across 10+ verified pharmacies in Kenya.
                    Compare prices, check availability, and find the nearest pharmacy.
                  </Typography>

                  {/* Quick Search */}
                  <Paper
                    component="form"
                    onSubmit={handleQuickSearch}
                    sx={{
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      maxWidth: 500,
                      boxShadow: 3
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search for medicines... (e.g., Paracetamol, Insulin)"
                      value={quickSearch}
                      onChange={(e) => setQuickSearch(e.target.value)}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="primary" />
                          </InputAdornment>
                        ),
                        sx: { '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ ml: 1, px: 3 }}
                    >
                      Search
                    </Button>
                  </Paper>

                  {/* Quick Actions */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/search?therapeuticClass=diabetes')}
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      🍯 Diabetes Meds
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/search?therapeuticClass=hypertension')}
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      ❤️ Blood Pressure
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/search?therapeuticClass=painkillers')}
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      🩹 Pain Relief
                    </Button>
                  </Box>
                </Box>
              </Slide>
            </Grid>

            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Stats Cards */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Fade in={statsVisible} timeout={1500}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                          <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                            50+
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Medicines Available
                          </Typography>
                        </Card>
                      </Fade>
                    </Grid>
                    <Grid item xs={6}>
                      <Fade in={statsVisible} timeout={2000}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                          <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                            10+
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Verified Pharmacies
                          </Typography>
                        </Card>
                      </Fade>
                    </Grid>
                    <Grid item xs={6}>
                      <Fade in={statsVisible} timeout={2500}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                          <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                            24/7
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Emergency Access
                          </Typography>
                        </Card>
                      </Fade>
                    </Grid>
                    <Grid item xs={6}>
                      <Fade in={statsVisible} timeout={3000}>
                        <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                          <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                            🇰🇪
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Kenya Wide
                          </Typography>
                        </Card>
                      </Fade>
                    </Grid>
                  </Grid>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Location Alert */}
      {userLocation && (
        <Container maxWidth="lg" sx={{ mt: -2, position: 'relative', zIndex: 1 }}>
          <Alert
            severity="success"
            icon={<LocationOn />}
            sx={{ boxShadow: 2 }}
          >
            <Typography variant="body2">
              📍 Location detected! Showing medicines and pharmacies near you.
            </Typography>
          </Alert>
        </Container>
      )}

      {/* Featured Medicines Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            🔥 Most Searched Medicines
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Popular medicines available across multiple pharmacies
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {featuredMedicines.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in={true} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(`/search?search=${item.medicine.name}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h2" sx={{ mr: 1 }}>
                        {getTherapeuticIcon(item.medicine.therapeuticClass)}
                      </Typography>
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {item.medicine.name}
                        </Typography>
                        <Chip
                          label={item.medicine.therapeuticClass}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.medicine.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          From {formatPrice(item.avgPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📍 {item.pharmacyCount} pharmacies
                        </Typography>
                      </Box>
                      <IconButton color="primary">
                        <ArrowForward />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/search')}
            endIcon={<ArrowForward />}
          >
            View All Medicines
          </Button>
        </Box>
      </Container>

      {/* Nearby Pharmacies Section */}
      <Box sx={{ bgcolor: '#f8fffe', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              🏥 Nearby Pharmacies
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Verified pharmacies near your location
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {nearbyPharmacies.map((pharmacy, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Fade in={true} timeout={1000 + index * 300}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => navigate(`/map?pharmacy=${pharmacy.name}`)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <LocalPharmacy />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                              {pharmacy.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Rating value={pharmacy.rating} readOnly size="small" precision={0.1} />
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                ({pharmacy.rating})
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Chip
                          label={pharmacy.isCurrentlyOpen ? 'Open Now' : 'Closed'}
                          color={pharmacy.isCurrentlyOpen ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        📍 {pharmacy.address}
                      </Typography>

                      {pharmacy.distance && (
                        <Typography variant="body2" color="primary" sx={{ mb: 2, fontWeight: 'medium' }}>
                          📐 {formatDistance(pharmacy.distance)}
                        </Typography>
                      )}

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Services:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                          {pharmacy.services?.map((service) => (
                            <Chip
                              key={service}
                              label={service}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          size="small"
                          startIcon={<Phone />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${pharmacy.phone}`, '_self');
                          }}
                        >
                          Call
                        </Button>
                        <Button
                          size="small"
                          endIcon={<Place />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/map?pharmacy=${pharmacy.name}`);
                          }}
                        >
                          View on Map
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/map')}
              endIcon={<LocationOn />}
            >
              View All Pharmacies
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            ✨ Why Choose MedAssist?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your trusted companion for medicine search in Kenya
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: <Speed sx={{ fontSize: 40 }} />,
              title: 'Fast Search',
              description: 'Find medicines instantly across 50+ medicines and 10+ pharmacies',
              color: '#10b981'
            },
            {
              icon: <Security sx={{ fontSize: 40 }} />,
              title: 'Verified Pharmacies',
              description: 'All pharmacies are licensed and verified for your safety',
              color: '#3b82f6'
            },
            {
              icon: <LocationOn sx={{ fontSize: 40 }} />,
              title: 'Location-Based',
              description: 'Find the nearest pharmacies with real-time availability',
              color: '#ef4444'
            },
            {
              icon: <TrendingUp sx={{ fontSize: 40 }} />,
              title: 'Price Comparison',
              description: 'Compare prices across pharmacies to get the best deals',
              color: '#f59e0b'
            },
            {
              icon: <AccessTime sx={{ fontSize: 40 }} />,
              title: '24/7 Access',
              description: 'Find 24-hour pharmacies for emergency medicine needs',
              color: '#8b5cf6'
            },
            {
              icon: <Favorite sx={{ fontSize: 40 }} />,
              title: 'Specialized Care',
              description: 'Access oncology, diabetes, and other specialized medicines',
              color: '#ec4899'
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in={true} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: feature.color,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Subscription CTA */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            💎 Upgrade to Premium
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Get advanced features, priority support, and exclusive access to specialized medicines
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4, flexWrap: 'wrap' }}>
            {[
              'Advanced Search Filters',
              'Priority Pharmacy Listings',
              'Stock Alerts',
              'Telemedicine Access',
              'M-Pesa Payments'
            ].map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 1, color: '#10b981' }} />
                <Typography variant="body1">{feature}</Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/subscription')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { bgcolor: '#f8fffe' }
            }}
          >
            View Subscription Plans
          </Button>
        </Container>
      </Box>

      {/* Footer Info */}
      <Box sx={{ bgcolor: '#1f2937', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                🏥 MedAssist Kenya
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Your trusted partner for finding medicines across Kenya. 
                Search, compare, and locate medicines with ease.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Phone />}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  +254726013909
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Email />}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  support@medassist.co.ke
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                🎯 Quick Stats
              </Typography>
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                    <LocalPharmacy />
                  </ListItemIcon>
                  <ListItemText primary="50+ Medicines Available" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                    <LocalHospital />
                  </ListItemIcon>
                  <ListItemText primary="10+ Verified Pharmacies" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                    <Schedule />
                  </ListItemIcon>
                  <ListItemText primary="24/7 Emergency Access" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ color: 'white', minWidth: 32 }}>
                    <Place />
                  </ListItemIcon>
                  <ListItemText primary="Kenya-wide Coverage" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;