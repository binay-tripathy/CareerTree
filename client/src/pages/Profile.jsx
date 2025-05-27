import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Profile Page
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Your professional profile
        </Typography>
      </Box>
    </Container>
  );
};

export default Profile;
