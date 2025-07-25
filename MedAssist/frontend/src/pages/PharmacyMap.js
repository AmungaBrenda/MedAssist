import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Avatar,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Search,
  Directions,
  LocalPharmacy,
  MyLocation
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const PharmacyMap = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    is24Hours: '',
    services: ''
  });
  const [geolocationError, setGeolocationError] = useState(null);

  const [map, setMap] = useState(null);
  const markersRef = useRef([]);

  const loadGoogleMapsScript = useCallback(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    if (document.getElementById('google-maps-script')) {
      const existingScript = document.getElementById('google-maps-script');
      existingScript.onload = () => setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      console.error('Google Maps failed to load');
      toast.error('Map failed to load. Using list view only.');
    };
    document.head.appendChild(script);
  }, []);

  const fetchNearbyPharmacies = useCallback(async (location) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/pharmacies/nearby', {
        params: {
          latitude: location.lat,
          longitude: location.lng,
          radius: 50000,
        },
      });
      setPharmacies(response.data.pharmacies || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      // Mock fallback data
      const mockPharmacies = [
        /* ...mock data unchanged from your code... */
        {
          _id: '1',
          name: 'Nairobi Hospital Pharmacy',
          address: 'Argwings Kodhek Road, Nairobi',
          phone: '+254726013909',
          rating: 4.8,
          location: { coordinates: [36.8125, -1.2966] },
          distance: 1200,
          isCurrentlyOpen: true,
          is24Hours: true,
          services: ['prescription', 'consultation', 'delivery', 'insurance'],
          specialties: ['oncology', 'diabetes', 'hypertension', 'general']
        },
        {
          _id: '2',
          name: 'Kenyatta Hospital Pharmacy',
          address: 'Hospital Road, Nairobi',
          phone: '+254720123456',
          rating: 4.6,
          location: { coordinates: [36.8058, -1.3006] },
          distance: 2800,
          isCurrentlyOpen: true,
          is24Hours: true,
          services: ['prescription', 'consultation', 'insurance'],
          specialties: ['oncology', 'diabetes', 'hypertension', 'pediatrics']
        },
        {
          _id: '3',
          name: 'Goodlife Pharmacy Westlands',
          address: 'Westlands Shopping Centre',
          phone: '+254711234567',
          rating: 4.5,
          location: { coordinates: [36.8088, -1.263] },
          distance: 3100,
          isCurrentlyOpen: true,
          is24Hours: false,
          services: ['prescription', 'delivery'],
          specialties: ['diabetes', 'hypertension', 'general']
        },
        {
          _id: '4',
          name: 'Mediplus Pharmacy Karen',
          address: 'Karen Shopping Centre, Karen Road',
          phone: '+254722345678',
          rating: 4.3,
          location: { coordinates: [36.6826, -1.3194] },
          distance: 8500,
          isCurrentlyOpen: true,
          is24Hours: false,
          services: ['prescription', 'delivery', 'vaccination'],
          specialties: ['general', 'pediatrics']
        },
        {
          _id: '5',
          name: 'Alpha Pharmacy CBD',
          address: 'Kimathi Street, CBD',
          phone: '+254733456789',
          rating: 4.1,
          location: { coordinates: [36.8219, -1.2865] },
          distance: 1800,
          isCurrentlyOpen: false,
          is24Hours: false,
          services: ['prescription', 'consultation'],
          specialties: ['general']
        }
      ];
      setPharmacies(mockPharmacies);
      toast.success(`Found ${mockPharmacies.length} pharmacies`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setGeolocationError('Geolocation is not supported.');
      const fallback = { lat: -1.2921, lng: 36.8219 };
      setUserLocation(fallback);
      fetchNearbyPharmacies(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        fetchNearbyPharmacies(location);
        setGeolocationError(null);
        toast.success('Location detected!');
      },
      (error) => {
        let message = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied.';
            toast.error(message + ' Using default location.');
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            toast.error(message + ' Using default location.');
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            toast.error(message + ' Using default location.');
            break;
          default:
            message = 'An unknown location error occurred.';
            toast.error(message + ' Using default location.');
            break;
        }
        setGeolocationError(message);
        const fallbackLocation = { lat: -1.2921, lng: 36.8219 };
        setUserLocation(fallbackLocation);
        fetchNearbyPharmacies(fallbackLocation);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchNearbyPharmacies]);

  const initializeMap = useCallback(() => {
    if (!window.google || !userLocation) return;

    const mapDiv = document.getElementById('google-map');
    if (!mapDiv) return;

    const mapOptions = {
      center: userLocation,
      zoom: 13,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
    };

    const mapInstance = new window.google.maps.Map(mapDiv, mapOptions);

    new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: 'Your Location',
      icon: {
        url:
          'data:image/svg+xml;charset=UTF-8,' +
          encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="white"/>
      </svg>
    `),
        scaledSize: new window.google.maps.Size(24, 24),
      },
    });

    setMap(mapInstance);
  }, [userLocation]);

  const updateMapMarkers = useCallback(() => {
    if (!map || !window.google) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    filteredPharmacies.forEach(pharmacy => {
      const position = {
        lat: pharmacy.location.coordinates[1],
        lng: pharmacy.location.coordinates[0],
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: pharmacy.name,
        icon: {
          url:
            'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${pharmacy.isCurrentlyOpen ? '#10b981' : '#ef4444'}" stroke="white" stroke-width="1"/>
                <path d="M12 6.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill="white"/>
                <path d="M11 7h2v1h-2zm0 2h2v1h-2z" fill="${pharmacy.isCurrentlyOpen ? '#10b981' : '#ef4444'}"/>
              </svg>`),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      marker.addListener('click', () => {
        setSelectedPharmacy(pharmacy);
        map.setCenter(position);
        map.setZoom(15);
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1e3a8a;">${pharmacy.name}</h3>
            <p style="margin: 4px 0; color: #666;"><strong>📍</strong> ${pharmacy.address}</p>
            <p style="margin: 4px 0; color: #666;"><strong>📞</strong> ${pharmacy.phone}</p>
            <p style="margin: 4px 0; color: #666;"><strong>⭐</strong> ${pharmacy.rating}/5</p>
            <p style="margin: 4px 0;">
              <span style="background: ${pharmacy.isCurrentlyOpen ? '#10b981' : '#ef4444'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                ${pharmacy.isCurrentlyOpen ? 'Open' : 'Closed'}
              </span>
            </p>
            ${pharmacy.is24Hours ? '<p style="margin: 4px 0; color: #10b981; font-weight: bold;">24 Hours</p>' : ''}
          </div>
        `,
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
    });
  }, [map, filteredPharmacies]);

  const filterPharmacies = useCallback(() => {
    const filtered = pharmacies.filter(pharmacy => {
      const matchesSearch =
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        !filters.specialty || pharmacy.specialties.includes(filters.specialty);

      const matches24Hours =
        filters.is24Hours === '' ||
        (filters.is24Hours === 'true' && pharmacy.is24Hours) ||
        (filters.is24Hours === 'false' && !pharmacy.is24Hours);

      const matchesServices =
        !filters.services || pharmacy.services.includes(filters.services);

      return matchesSearch && matchesSpecialty && matches24Hours && matchesServices;
    });

    setFilteredPharmacies(filtered);
  }, [pharmacies, searchTerm, filters]);

  useEffect(() => {
    getUserLocation();
    loadGoogleMapsScript();
  }, [getUserLocation, loadGoogleMapsScript]);

  useEffect(() => {
    if (mapLoaded && userLocation) {
      initializeMap();
    }
  }, [mapLoaded, userLocation, initializeMap]);

  useEffect(() => {
    if (pharmacies.length > 0 && map) {
      updateMapMarkers();
    }
  }, [pharmacies, map, updateMapMarkers]);

  useEffect(() => {
    filterPharmacies();
  }, [filterPharmacies]);

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) return `${Math.round(distance)}m away`;
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  const getDirections = (pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharmacy.address)}`;
    window.open(url, '_blank');
  };

  const centerOnPharmacy = (pharmacy) => {
    if (map) {
      const position = {
        lat: pharmacy.location.coordinates[1],
        lng: pharmacy.location.coordinates[0]
      };
      map.setCenter(position);
      map.setZoom(16);
      setSelectedPharmacy(pharmacy);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
        Find Nearby Pharmacies
      </Typography>

      {geolocationError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⚠️ {geolocationError} Using default location.
        </Alert>
      )}

      {userLocation && (
        <Alert severity="success" sx={{ mb: 3 }}>
          📍 Location detected! Showing pharmacies within 50km radius.
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search pharmacies by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={filters.specialty}
                label="Specialty"
                onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
              >
                <MenuItem value="">All Specialties</MenuItem>
                <MenuItem value="oncology">🎗️ Oncology</MenuItem>
                <MenuItem value="diabetes">🍯 Diabetes</MenuItem>
                <MenuItem value="hypertension">❤️ Hypertension</MenuItem>
                <MenuItem value="pediatrics">👶 Pediatrics</MenuItem>
                <MenuItem value="general">💊 General</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Hours</InputLabel>
              <Select
                value={filters.is24Hours}
                label="Hours"
                onChange={(e) => setFilters({ ...filters, is24Hours: e.target.value })}
              >
                <MenuItem value="">All Hours</MenuItem>
                <MenuItem value="true">24 Hours</MenuItem>
                <MenuItem value="false">Regular Hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Services</InputLabel>
              <Select
                value={filters.services}
                label="Services"
                onChange={(e) => setFilters({ ...filters, services: e.target.value })}
              >
                <MenuItem value="">All Services</MenuItem>
                <MenuItem value="delivery">🚚 Delivery</MenuItem>
                <MenuItem value="consultation">👨‍⚕️ Consultation</MenuItem>
                <MenuItem value="insurance">💳 Insurance</MenuItem>
                <MenuItem value="vaccination">💉 Vaccination</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={getUserLocation}
              startIcon={<MyLocation />}
              sx={{ height: 56 }}
            >
              My Location
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: { xs: 400, lg: 600 } }}>
            <CardContent sx={{ p: 1, height: '100%' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                // The map container must always be rendered
                <Box
                  id="google-map"
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {!mapLoaded && (
                    <Box sx={{ textAlign: 'center' }}>
                      <LocationOn sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Interactive Map Loading...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Google Maps will show pharmacy locations here
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ height: { xs: 'auto', lg: 600 }, overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              📍 Nearby Pharmacies ({filteredPharmacies.length} found)
            </Typography>

            {filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
                <Card
                  key={pharmacy._id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedPharmacy?._id === pharmacy._id ? '2px solid' : '1px solid',
                    borderColor: selectedPharmacy?._id === pharmacy._id ? 'primary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s',
                  }}
                  onClick={() => centerOnPharmacy(pharmacy)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedPharmacy?._id === pharmacy._id}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
                        <LocalPharmacy sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {pharmacy.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={pharmacy.rating} readOnly size="small" precision={0.1} />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            ({pharmacy.rating})
                          </Typography>
                          <Chip
                            label={pharmacy.isCurrentlyOpen ? 'Open' : 'Closed'}
                            color={pharmacy.isCurrentlyOpen ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {pharmacy.address}
                    </Typography>
                    {pharmacy.distance && (
                      <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 'medium' }}>
                        📐 {formatDistance(pharmacy.distance)}
                      </Typography>
                    )}
                    {pharmacy.is24Hours && (
                      <Chip label="24 Hours" color="success" size="small" sx={{ mb: 1, mr: 1 }} />
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
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
                        startIcon={<Directions />}
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(pharmacy);
                        }}
                      >
                        Directions
                      </Button>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      {pharmacy.services?.slice(0, 3).map((service) => (
                        <Chip
                          key={service}
                          label={service}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : !loading ? (
              <Alert severity="info">No pharmacies found matching your criteria.</Alert>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PharmacyMap;
