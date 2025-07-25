import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import { medicineService } from '../../services/medicineService';
import MedicineResultCard from './MedicineResultCard';

const MedicineSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    fetchCategories();
    getUserLocation();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await medicineService.getCategories();
      setCategories(response.categories);
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
      setError('Please enter a medicine name to search');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = {
        search: searchTerm,
        category: category || undefined,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        radius: 10000 // 10km radius
      };

      const response = await medicineService.searchMedicines(params);
      setResults(response.results);
      
      if (response.results.length === 0) {
        setError('No medicines found matching your search criteria');
      }
    } catch (error) {
      setError('Error searching for medicines. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      {/* Search Form */}
      <Card sx={{ mb: 4, p: 2 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search for medicines"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., Paracetamol, Amoxicillin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
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
        <Alert severity="success" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1 }} />
            Location detected - showing nearby pharmacies first
          </Box>
        </Alert>
      ) : locationError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Search Results ({results.length} medicines found)
          </Typography>
          <Grid container spacing={2}>
            {results.map((result, index) => (
              <Grid item xs={12} key={index}>
                <MedicineResultCard medicine={result} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default MedicineSearch;