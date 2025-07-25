import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Map,
  Payment,
  Person,
  Login,
  PersonAdd,
  LocalPharmacy,
  Close,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    handleProfileMenuClose();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { text: 'Search Medicines', icon: <Search />, path: '/search' },
    { text: 'Find Pharmacies', icon: <Map />, path: '/map' },
    { text: 'Subscription', icon: <Payment />, path: '/subscription' },
  ];

  const NavButton = ({ children, onClick, active = false, ...props }) => (
    <Button
      onClick={onClick}
      sx={{
        color: active ? theme.palette.secondary.main : 'white',
        fontWeight: active ? 600 : 400,
        mx: 1,
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Button>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 2
            }}
            onClick={() => navigate('/')}
          >
            <LocalPharmacy sx={{ fontSize: 32, mr: 1, color: '#10b981' }} />
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, white, #10b981)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              MedAssist
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 4 }}>
              {menuItems.map((item) => (
                <NavButton
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  active={isActive(item.path)}
                  startIcon={item.icon}
                >
                  {item.text}
                </NavButton>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ flexGrow: 1 }} />
          )}

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {/* User Subscription Status */}
                {user.subscription && user.subscription !== 'free' && (
                  <Chip
                    label={user.subscription.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: '#10b981',
                      color: 'white',
                      fontWeight: 'bold',
                      display: { xs: 'none', sm: 'inline-flex' }
                    }}
                  />
                )}
                
                {/* User Avatar & Menu */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0, ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: '#10b981',
                      width: 36,
                      height: 36,
                      fontSize: '1rem'
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ 
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                  startIcon={<Login />}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  sx={{ 
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                  startIcon={<PersonAdd />}
                >
                  Sign Up
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ color: 'white', ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { mt: 1, minWidth: 200 }
        }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
            {user.subscription && user.subscription !== 'free' && (
              <Chip
                label={`${user.subscription.toUpperCase()} Member`}
                size="small"
                sx={{ bgcolor: '#10b981', color: 'white', mt: 0.5 }}
              />
            )}
          </Box>
        )}
        
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon><Person /></ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={() => { navigate('/subscription'); handleProfileMenuClose(); }}>
          <ListItemIcon><Payment /></ListItemIcon>
          Subscription
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: 280 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.path}
              button
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                backgroundColor: isActive(item.path) ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(30, 58, 138, 0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? theme.palette.primary.main : 'inherit'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>

        {!user && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ px: 2, pb: 2 }}>
              <Button
                fullWidth
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                sx={{ mb: 1 }}
                startIcon={<Login />}
              >
                Login
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                startIcon={<PersonAdd />}
              >
                Sign Up
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
};

export default Navbar;