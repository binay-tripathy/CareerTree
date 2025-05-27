import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Messages = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Your conversations
        </Typography>
      </Box>
    </Container>
  );
};

export default Messages;
