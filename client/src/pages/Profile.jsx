import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Grid,
  Button,
  Chip
} from '@mui/material';
import { Edit, LocationOn, Work, School } from '@mui/icons-material';
import EditProfileDialog from '../components/EditProfileDialog';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Profile Header */}
      <Paper sx={{ 
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        overflow: 'hidden',
        mb: 3
      }}>
        {/* Cover Photo */}
        <Box sx={{ 
          height: 200,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative'
        }} />
        
        {/* Profile Info */}
        <Box sx={{ p: 4, mt: -10, position: 'relative' }}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item>
              <Avatar
                src={user?.profilePicture}
                sx={{ 
                  width: 150, 
                  height: 150,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  border: '6px solid white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                {user?.firstName?.[0] || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="700" sx={{ color: '#2c3e50', mb: 1 }}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                {user?.headline || 'Add a professional headline'}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <LocationOn sx={{ mr: 1, color: '#667eea' }} />
                <Typography color="textSecondary">
                  {user?.location || 'Add your location'}
                </Typography>
              </Box>
              <Typography variant="body2" color="primary" fontWeight="600">
                {user?.connections?.length || 0} connections
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: '600',
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 24px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* About Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            mb: 3
          }}>
            <Typography variant="h5" fontWeight="600" sx={{ color: '#2c3e50', mb: 3 }}>
              About
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#34495e' }}>
              {user?.about || 'Add a summary about yourself, your career goals, and what makes you unique as a professional.'}
            </Typography>
          </Paper>

          {/* Experience Section */}
          <Paper sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            mb: 3
          }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Work sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h5" fontWeight="600" sx={{ color: '#2c3e50' }}>
                Experience
              </Typography>
            </Box>
            <Typography variant="body1" color="textSecondary">
              Add your work experience to showcase your professional journey.
            </Typography>
          </Paper>

          {/* Education Section */}
          <Paper sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box display="flex" alignItems="center" mb={3}>
              <School sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h5" fontWeight="600" sx={{ color: '#2c3e50' }}>
                Education
              </Typography>
            </Box>
            <Typography variant="body1" color="textSecondary">
              Add your educational background and qualifications.
            </Typography>
          </Paper>
        </Grid>

        {/* Skills & Endorsements */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            mb: 3
          }}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50', mb: 3 }}>
              Skills & Endorsements
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label="JavaScript" 
                sx={{ 
                  mr: 1, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600'
                }} 
              />
              <Chip 
                label="React" 
                sx={{ 
                  mr: 1, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  fontWeight: '600'
                }} 
              />
              <Chip 
                label="Node.js" 
                sx={{ 
                  mr: 1, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  color: 'white',
                  fontWeight: '600'
                }} 
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Add skills to showcase your expertise
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <EditProfileDialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
      />
    </Container>
  );
};

export default Profile;
