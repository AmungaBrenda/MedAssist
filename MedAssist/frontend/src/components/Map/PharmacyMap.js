import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { Phone, Navigation, Star } from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom pharmacy icon
const pharmacyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMkU3RDMyIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTEgMTRoLTJ2LTJIOXYtMmgydi0yaDJ2Mmgydjh6Ii8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const LocationMarker = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [map, position]);

  return position ? (
    <Marker position={position}>
      <Popup>Your Location</Popup>
    </Marker>
  ) : null;
};

const PharmacyMap = ({ pharmacies = [], userLocation, onPharmacySelect }) => {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const defaultCenter = [-1.286389, 36.817223]; // Nairobi coordinates
  const center = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter;

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    if (onPharmacySelect) {
      onPharmacySelect(pharmacy);
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    }
    return `${(distance / 1000).toFixed(1)}km away`;
  };

  return (
    <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationMarker position={userLocation ? [userLocation.latitude, userLocation.longitude] : null} />
        
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy._id || pharmacy.id}
            position={[
              pharmacy.location.coordinates[1],
              pharmacy.location.coordinates[0]
            ]}
            icon={pharmacyIcon}
            eventHandlers={{
              click: () => handlePharmacyClick(pharmacy)
            }}
          >
            <Popup>
              <Paper sx={{ p: 2, minWidth: 250 }}>
                <Typography variant="h6" gutterBottom>
                  {pharmacy.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {pharmacy.address}
                </Typography>
                
                {pharmacy.rating > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Star sx={{ color: '#ffa726', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2">
                      {pharmacy.rating.toFixed(1)} ({pharmacy.totalReviews} reviews)
                    </Typography>
                  </Box>
                )}
                
                {pharmacy.distance && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Navigation sx={{ mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2">
                      {formatDistance(pharmacy.distance)}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="body2">
                    {pharmacy.phone}
                  </Typography>
                </Box>
                
                {pharmacy.services && pharmacy.services.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {pharmacy.services.map((service) => (
                      <Chip
                        key={service}
                        label={service}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
                
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={() => handlePharmacyClick(pharmacy)}
                >
                  View Details
                </Button>
              </Paper>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default PharmacyMap;