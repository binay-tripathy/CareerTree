import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';
import { updateProfile, uploadFile } from '../store/usersSlice';
import { loadUser } from '../store/authSlice';

const EditProfileDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, uploadProgress } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
    about: '',
    profilePicture: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        headline: user.headline || '',
        location: user.location || '',
        about: user.about || '',
        profilePicture: user.profilePicture || ''
      });
      setPreviewUrl(user.profilePicture || '');
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let updatedData = { ...formData };
      
      // Upload profile picture if selected
      if (selectedFile) {
        const uploadedUrl = await dispatch(uploadFile(selectedFile)).unwrap();
        updatedData.profilePicture = uploadedUrl;
      }

      // Update profile
      await dispatch(updateProfile(updatedData)).unwrap();
      
      // Reload user data
      await dispatch(loadUser());
      
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: '600',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '1.5rem'
      }}>
        Edit Profile
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Profile Picture Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={previewUrl}
                sx={{
                  width: 120,
                  height: 120,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  border: '4px solid white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                {formData.firstName?.[0]}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="profile-picture-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ mt: 2 }}>
                <CircularProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ color: '#667eea' }}
                />
              </Box>
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#fafbfc',
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#fafbfc',
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Software Engineer at Tech Company"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#fafbfc',
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#fafbfc',
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About"
                name="about"
                value={formData.about}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Tell us about yourself, your experience, and career goals..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#fafbfc',
                    '&:hover fieldset': {
                      borderColor: '#667eea'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            startIcon={<Cancel />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                background: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              '&:disabled': {
                background: '#e0e0e0'
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDialog;
