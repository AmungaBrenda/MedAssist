import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box
} from '@mui/material';
import { AccountCircle, LocalPharmacy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    handleClose();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2E7D32' }}>
      <Toolbar>
        <LocalPharmacy sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          MedAssist
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Hello, {user?.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                Profile
              </MenuItem>
              {user?.role === 'pharmacy' && (
                <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;