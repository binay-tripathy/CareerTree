import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Home, People, Message, AccountCircle } from '@mui/icons-material';
import { logout } from '../store/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setAnchorEl(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: 'white', 
        color: '#666',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 'lg', mx: 'auto', width: '100%' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/feed')}
        >
          Career Tree
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/feed')}
            sx={{ 
              color: isActive('/feed') ? '#667eea' : '#666',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
            }}
          >
            <Home />
          </IconButton>
          <IconButton
            onClick={() => navigate('/network')}
            sx={{ 
              color: isActive('/network') ? '#667eea' : '#666',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
            }}
          >
            <People />
          </IconButton>
          <IconButton
            onClick={() => navigate('/messages')}
            sx={{ 
              color: isActive('/messages') ? '#667eea' : '#666',
              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
            }}
          >
            <Message />
          </IconButton>
          
          <IconButton onClick={handleMenuOpen}>
            <Avatar
              src={user?.profilePicture}
              sx={{ 
                width: 32, 
                height: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1rem'
              }}
            >
              {user?.firstName?.[0] || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <AccountCircle sx={{ mr: 1 }} />
              View Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
