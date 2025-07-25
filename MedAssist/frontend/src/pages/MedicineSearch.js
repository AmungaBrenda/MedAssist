import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Rating
} from '@mui/material';
import {
  Search,
  LocationOn,
  LocalPharmacy,
  Phone,
  AccessTime,
  Navigation,
  ExpandMore
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const MedicineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [therapeuticClass, setTherapeuticClass] = useState('');
  const [categories, setCategories] = useState([]);
  const [therapeuticClasses, setTherapeuticClasses] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchCategories();
    getUserLocation();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/medicines/categories');
      setCategories(response.data.categories || []);
      setTherapeuticClasses(response.data.therapeuticClasses || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success('Location detected! Showing nearby pharmacies first.');
      },
      (error) => {
        setLocationError('Unable to get your location. Search results may be limited.');
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.error('Please enter a medicine name to search');
      return;
    }

    setLoading(true);

    try {
      const params = {
        search: searchTerm,
        category: category || undefined,
        therapeuticClass: therapeuticClass || undefined,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radius: 20000
      };

      const response = await axios.get('/api/medicines/search', { params });
      setResults(response.data.results || []);
      
      if (response.data.results.length === 0) {
        toast.warning('No medicines found matching your search criteria');
      } else {
        toast.success(`Found ${response.data.results.length} medicines`);
      }
    } catch (error) {
      toast.error('Error searching for medicines. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getOpenStatus = (pharmacy) => {
    if (pharmacy.is24Hours) return { isOpen: true, text: '24 Hours' };
    return pharmacy.isCurrentlyOpen ? 
      { isOpen: true, text: 'Open Now' } : 
      { isOpen: false, text: 'Closed' };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        🔍 Find Your Medicine
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 4, p: 3 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search for medicines"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Paracetamol, Insulin, Metformin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Medical Category</InputLabel>
                <Select
                  value={therapeuticClass}
                  label="Medical Category"
                  onChange={(e) => setTherapeuticClass(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="oncology">🎗️ Oncology</MenuItem>
                  <MenuItem value="diabetes">🍯 Diabetes</MenuItem>
                  <MenuItem value="hypertension">❤️ Hypertension</MenuItem>
                  <MenuItem value="antibiotics">💊 Antibiotics</MenuItem>
                  <MenuItem value="painkillers">🩹 Pain Relief</MenuItem>
                  <MenuItem value="vitamins">🌟 Vitamins</MenuItem>
                  {therapeuticClasses.map((tc) => (
                    <MenuItem key={tc} value={tc}>
                      {tc.charAt(0).toUpperCase() + tc.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ height: 56 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Location Status */}
      {userLocation ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1 }} />
            Location detected - showing nearby pharmacies first
          </Box>
        </Alert>
      ) : locationError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {locationError}
        </Alert>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Search Results ({results.length} medicines found)
          </Typography>
          
          {results.map((result, index) => (
            <Card key={index} sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  {/* Medicine Information */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom color="primary">
                      {result.medicine.name}
                    </Typography>
                    
                    {result.medicine.genericName && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Generic:</strong> {result.medicine.genericName}
                      </Typography>
                    )}
                    
                    {result.medicine.brand && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Brand:</strong> {result.medicine.brand}
                      </Typography>
                    )}

                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={result.medicine.category}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={result.medicine.therapeuticClass}
                        size="small"
                        color="secondary"
                      />
                      {result.medicine.requiresPrescription && (
                        <Chip
                          label="Prescription Required"
                          size="small"
                          color="warning"
                        />
                      )}
                      {result.medicine.isControlled && (
                        <Chip
                          label="Controlled Drug"
                          size="small"
                          color="error"
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Availability Information */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      📍 Available at {result.availability.length} pharmacies
                    </Typography>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle2">
                          View All Pharmacies & Prices
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {result.availability.map((availability, idx) => (
                            <ListItem key={idx} divider>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LocalPharmacy color="primary" />
                                      <Typography variant="body1" fontWeight="medium">
                                        {availability.pharmacy.name}
                                      </Typography>
                                      {availability.pharmacy.rating > 0 && (
                                        <Rating
                                          value={availability.pharmacy.rating}
                                          readOnly
                                          size="small"
                                        />
                                      )}
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Typography variant="h6" color="primary">
                                        {availability.discountPrice ? (
                                          <>
                                            <span style={{ textDecoration: 'line-through', fontSize: '0.8em', color: '#999' }}>
                                              {formatPrice(availability.price)}
                                            </span>
                                            {' '}
                                            {formatPrice(availability.discountPrice)}
                                          </>
                                        ) : (
                                          formatPrice(availability.price)
                                        )}
                                      </Typography>
                                      
                                      <Chip
                                        label={availability.status.replace('_', ' ')}
                                        size="small"
                                        color={availability.status === 'available' ? 'success' : 'warning'}
                                      />
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" display="block">
                                      📍 {availability.pharmacy.address}
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                                        <Typography variant="caption">
                                          {availability.pharmacy.phone}
                                        </Typography>
                                      </Box>
                                      
                                      {availability.distance && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Navigation sx={{ fontSize: 14, mr: 0.5 }} />
                                          <Typography variant="caption">
                                            {formatDistance(availability.distance)}
                                          </Typography>
                                        </Box>
                                      )}
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                                        <Typography 
                                          variant="caption"
                                          color={getOpenStatus(availability.pharmacy).isOpen ? 'success.main' : 'error.main'}
                                        >
                                          {getOpenStatus(availability.pharmacy).text}
                                        </Typography>
                                      </Box>
                                      
                                      <Typography variant="caption">
                                        📦 Stock: {availability.quantity} units
                                      </Typography>
                                    </Box>

                                    {availability.pharmacy.services && (
                                      <Box sx={{ mt: 1 }}>
                                        {availability.pharmacy.services.map((service) => (
                                          <Chip
                                            key={service}
                                            label={service}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && searchTerm && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography>
            No medicines found for "{searchTerm}". Try:
          </Typography>
          <ul>
            <li>Checking your spelling</li>
            <li>Using generic names (e.g., "Paracetamol" instead of "Panadol")</li>
            <li>Searching by therapeutic class (e.g., "diabetes", "hypertension")</li>
          </ul>
        </Alert>
      )}
    </Container>
  );
};

export default MedicineSearch;