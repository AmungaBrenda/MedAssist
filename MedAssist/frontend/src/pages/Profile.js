
// Profile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Person, Edit, Payment, History } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        👤 My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Chip
              label={user.role?.toUpperCase()}
              color="primary"
              sx={{ mb: 2 }}
            />
            {user.subscription && user.subscription !== 'free' && (
              <Chip
                label={`${user.subscription.toUpperCase()} Member`}
                color="secondary"
                sx={{ ml: 1 }}
              />
            )}
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<Edit />} fullWidth>
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Phone Number"
                        secondary={user.phone}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Address"
                        secondary={user.address || 'Not provided'}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Account Type"
                        secondary={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText
                        primary="Member Since"
                        secondary={new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/subscription')}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Payment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.subscription === 'free' ? 'Free Plan' : `${user.subscription?.toUpperCase()} Plan`}
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>
                    {user.subscription === 'free' ? 'Upgrade' : 'Manage'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card sx={{ cursor: 'pointer' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <History sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Search History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View your recent searches
                  </Typography>
                  <Button size="small" sx={{ mt: 1 }}>
                    View History
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Profile;
