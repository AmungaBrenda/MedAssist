import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f5f5f5',
        py: 3,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 MedAssist. All rights reserved. |{' '}
          <Link color="inherit" href="/privacy">
            Privacy Policy
          </Link>{' '}
          |{' '}
          <Link color="inherit" href="/terms">
            Terms of Service
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;