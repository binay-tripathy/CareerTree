import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Grid,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import { PersonAdd, People, Search, Message } from '@mui/icons-material';
import { 
  searchUsers, 
  getConnections, 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  rejectConnectionRequest, 
  cancelConnectionRequest,
  clearSearchResults 
} from '../store/usersSlice';

const Network = () => {
  const dispatch = useDispatch();
  const { searchResults, connections, loading, error } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionRequests, setConnectionRequests] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    dispatch(getConnections());
  }, [dispatch]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      dispatch(searchUsers(searchQuery));
    }
  };

  const handleConnect = async (userId) => {
    try {
      setConnectionRequests(prev => ({ ...prev, [userId]: 'pending' }));
      await dispatch(sendConnectionRequest(userId)).unwrap();
      setConnectionRequests(prev => ({ ...prev, [userId]: 'sent' }));
    } catch (error) {
      console.error('Connection request failed:', error);
      setConnectionRequests(prev => ({ ...prev, [userId]: 'error' }));
      setTimeout(() => {
        setConnectionRequests(prev => ({ ...prev, [userId]: null }));
      }, 3000);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await dispatch(acceptConnectionRequest(userId)).unwrap();
      dispatch(getConnections());
    } catch (error) {
      console.error('Failed to accept connection:', error);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await dispatch(rejectConnectionRequest(userId)).unwrap();
      dispatch(getConnections());
    } catch (error) {
      console.error('Failed to reject connection:', error);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await dispatch(cancelConnectionRequest(userId)).unwrap();
      dispatch(getConnections());
    } catch (error) {
      console.error('Failed to cancel connection:', error);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMessageUser = (userId) => {
    // Check if user is connected
    const isConnected = connections?.connections?.some(conn => conn._id === userId);
    if (!isConnected) {
      alert('You can only message your connections. Please connect with this user first.');
      return;
    }
    window.location.href = `/messages?user=${userId}`;
  };

  const getConnectionStatus = (userId) => {
    if (connections?.connections?.some(c => c._id === userId)) return 'connected';
    if (connections?.sentRequests?.some(r => r.user._id === userId)) return 'sent';
    if (connections?.receivedRequests?.some(r => r.user._id === userId)) return 'received';
    return 'none';
  };

  const filteredSearchResults = searchResults.filter(
    (u) => u._id !== user?._id && u._id !== user?.id
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ 
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        mb: 4,
        textAlign: 'center'
      }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <People sx={{ mr: 2, color: '#667eea', fontSize: '2.5rem' }} />
          <Typography variant="h4" fontWeight="700" sx={{ color: '#2c3e50' }}>
            My Network
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
          Grow your professional network and discover new opportunities
        </Typography>
        
        {/* Search */}
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search for professionals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  sx={{
                    ml: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Search
                </Button>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: 'white',
                '&:hover fieldset': {
                  borderColor: '#667eea'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea'
                }
              }
            }}
          />
        </Box>

        <Box display="flex" justifyContent="center" gap={2}>
          <Chip 
            label={`Connections (${connections.connections?.length || 0})`}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '600',
              px: 2
            }} 
          />
          <Chip 
            label={`Sent Requests (${connections.sentRequests?.length || 0})`}
            sx={{ 
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              fontWeight: '600',
              px: 2
            }} 
          />
          <Chip 
            label={`Received Requests (${connections.receivedRequests?.length || 0})`}
            sx={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              fontWeight: '600',
              px: 2
            }} 
          />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {loading && searchQuery.trim() && (
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <Chip label="Searching..." color="primary" />
        </Box>
      )}
      
      {filteredSearchResults.length > 0 && (
        <Paper sx={{ 
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          mb: 4
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50' }}>
              Search Results
            </Typography>
            <Button
              onClick={() => {
                dispatch(clearSearchResults());
                setSearchQuery('');
                setConnectionRequests({});
              }}
              variant="outlined"
              size="small"
            >
              Clear
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {filteredSearchResults.map((user) => {
              const status = getConnectionStatus(user._id);
              const buttonBg = status === 'connected' 
                ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                : status === 'sent' || connectionRequests[user._id] === 'sent'
                ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              
              const buttonText = connectionRequests[user._id] === 'pending' 
                ? 'Sending...'
                : status === 'connected'
                ? 'Connected'
                : status === 'sent' || connectionRequests[user._id] === 'sent'
                ? 'Request Sent'
                : status === 'received'
                ? 'Request Received'
                : connectionRequests[user._id] === 'error'
                ? 'Try Again'
                : 'Connect';

              return (
                <Grid item xs={12} md={6} lg={4} key={user._id}>
                  <Card sx={{
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        src={user.profilePicture}
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {user.firstName?.[0]}
                      </Avatar>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {user.headline || 'Professional'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        {user.location || 'Location not specified'}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => handleConnect(user._id)}
                        disabled={
                          connectionRequests[user._id] === 'pending' ||
                          status !== 'none'
                        }
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          background: buttonBg,
                          '&:hover': {
                            transform: 'scale(1.02)'
                          },
                          '&:disabled': {
                            background: '#e0e0e0'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {buttonText}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={() => handleMessageUser(user._id)}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          borderColor: '#667eea',
                          color: '#667eea',
                          '&:hover': {
                            borderColor: '#5a6fd8',
                            background: 'rgba(102, 126, 234, 0.1)',
                            transform: 'scale(1.02)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Navigation Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 2,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            mb: 3
          }}>
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant={activeTab === 0 ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(0)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  background: activeTab === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  borderColor: '#667eea',
                  color: activeTab === 0 ? 'white' : '#667eea'
                }}
              >
                My Connections ({connections.connections?.length || 0})
              </Button>
              <Button
                variant={activeTab === 1 ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(1)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  background: activeTab === 1 ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' : 'transparent',
                  borderColor: '#FF9800',
                  color: activeTab === 1 ? 'white' : '#FF9800'
                }}
              >
                Sent Requests ({connections.sentRequests?.length || 0})
              </Button>
              <Button
                variant={activeTab === 2 ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(2)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  background: activeTab === 2 ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'transparent',
                  borderColor: '#4CAF50',
                  color: activeTab === 2 ? 'white' : '#4CAF50'
                }}
              >
                Received Requests ({connections.receivedRequests?.length || 0})
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Content based on active tab */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {activeTab === 0 && (
              <div>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50', mb: 3 }}>
                  Your Connections
                </Typography>
                {connections.connections?.length > 0 ? (
                  <Grid container spacing={2}>
                    {connections.connections.map((connection) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={connection._id}>
                        <Card sx={{
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                          }
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Avatar
                              src={connection.profilePicture}
                              sx={{
                                width: 48,
                                height: 48,
                                mx: 'auto',
                                mb: 1,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {connection.firstName?.[0]}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="600">
                              {connection.firstName} {connection.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {connection.headline || 'Professional'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <People sx={{ fontSize: '4rem', color: '#667eea', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No connections yet
                    </Typography>
                  </Box>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50', mb: 3 }}>
                  Sent Requests
                </Typography>
                {connections.sentRequests?.length > 0 ? (
                  <Grid container spacing={2}>
                    {connections.sentRequests.map((request) => (
                      <Grid item xs={12} sm={6} md={4} key={request.user._id}>
                        <Card sx={{ borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Avatar
                              src={request.user.profilePicture}
                              sx={{
                                width: 48,
                                height: 48,
                                mx: 'auto',
                                mb: 1,
                                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {request.user.firstName?.[0]}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="600">
                              {request.user.firstName} {request.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                              Request sent
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleCancelRequest(request.user._id)}
                              sx={{ color: '#f44336', borderColor: '#f44336' }}
                            >
                              Cancel Request
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No sent requests
                    </Typography>
                  </Box>
                )}
              </div>
            )
          }

            {activeTab === 2 && (
              <div>
                <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50', mb: 3 }}>
                  Received Requests
                </Typography>
                {connections.receivedRequests?.length > 0 ? (
                  <Grid container spacing={2}>
                    {connections.receivedRequests.map((request) => (
                      <Grid item xs={12} sm={6} md={4} key={request.user._id}>
                        <Card sx={{ borderRadius: 3 }}>
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Avatar
                              src={request.user.profilePicture}
                              sx={{
                                width: 48,
                                height: 48,
                                mx: 'auto',
                                mb: 1,
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {request.user.firstName?.[0]}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="600">
                              {request.user.firstName} {request.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                              Wants to connect
                            </Typography>
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleAcceptRequest(request.user._id)}
                                sx={{
                                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                  px: 2
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRejectRequest(request.user._id)}
                                sx={{ color: '#f44336', borderColor: '#f44336', px: 2 }}
                              >
                                Reject
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="textSecondary">
                      No received requests
                    </Typography>
                  </Box>
                )}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Network;
