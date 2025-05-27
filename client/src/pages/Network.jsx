import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Network = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          My Network
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Grow your professional network
        </Typography>
      </Box>
    </Container>
  );
};

export default Network;
