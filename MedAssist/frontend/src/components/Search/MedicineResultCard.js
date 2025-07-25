import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Rating
} from '@mui/material';
import { ExpandMore, ExpandLess, LocalPharmacy, Phone, Navigation } from '@mui/icons-material';

const MedicineResultCard = ({ medicine }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Medicine Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {medicine.medicine.name}
            </Typography>
            {medicine.medicine.genericName && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Generic: {medicine.medicine.genericName}
              </Typography>
            )}
            {medicine.medicine.brand && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Brand: {medicine.medicine.brand}
              </Typography>
            )}
            <Chip
              label={medicine.medicine.category}
              size="small"
              color="primary"
              sx={{ mt: 1 }}
            />
            {medicine.medicine.requiresPrescription && (
              <Chip
                label="Prescription Required"
                size="small"
                color="warning"
                sx={{ mt: 1, ml: 1 }}
              />
            )}
          </Grid>

          {/* Availability Summary */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              Available at {medicine.availability.length} pharmacies
            </Typography>
            
            {/* Show first 3 pharmacies */}
            {medicine.availability.slice(0, 3).map((availability, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalPharmacy sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {availability.pharmacy.name}
                      </Typography>
                    </Box>
                    {availability.pharmacy.rating > 0 && (
                      <Rating
                        value={availability.pharmacy.rating}
                        readOnly
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2">
                      {availability.discountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#999' }}>
                            {formatPrice(availability.price)}
                          </span>
                          <br />
                          <strong>{formatPrice(availability.discountPrice)}</strong>
                        </>
                      ) : (
                        <strong>{formatPrice(availability.price)}</strong>
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Chip
                      label={availability.status.replace('_', ' ')}
                      size="small"
                      color={availability.status === 'available' ? 'success' : 'warning'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    {availability.distance && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Navigation sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2">
                          {formatDistance(availability.distance)}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}

            {/* Show More/Less Button */}
            {medicine.availability.length > 3 && (
              <Button
                onClick={handleExpandClick}
                endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                sx={{ mt: 1 }}
              >
                {expanded ? 'Show Less' : `Show ${medicine.availability.length - 3} More`}
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            All Available Pharmacies:
          </Typography>
          <List dense>
            {medicine.availability.slice(3).map((availability, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {availability.pharmacy.name}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {availability.discountPrice ? formatPrice(availability.discountPrice) : formatPrice(availability.price)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {availability.pharmacy.address}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Phone sx={{ mr: 0.5, fontSize: 14 }} />
                        <Typography variant="caption">
                          {availability.pharmacy.phone}
                        </Typography>
                        {availability.distance && (
                          <>
                            <Navigation sx={{ ml: 2, mr: 0.5, fontSize: 14 }} />
                            <Typography variant="caption">
                              {formatDistance(availability.distance)}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default MedicineResultCard;