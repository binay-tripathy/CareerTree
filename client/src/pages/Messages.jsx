import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  Badge,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Chip
} from '@mui/material';
import {
  Message,
  Send,
  Search,
  Chat,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  PersonAdd,
  VideoCall,
  Phone
} from '@mui/icons-material';
import {
  getConversations,
  getConversation,
  sendMessage,
  setActiveConversation,
  markAsRead,
  clearError
} from '../store/messagesSlice';
import { getConnections } from '../store/usersSlice';

const Messages = () => {
  const dispatch = useDispatch();
  const { conversations, currentConversation, activeConversationId, loading, sending, error } = useSelector((state) => state.messages);
  const { connections } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);

  useEffect(() => {
    dispatch(getConversations());
    dispatch(getConnections());
  }, [dispatch]);

  useEffect(() => {
    // Check for user parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId && !activeConversationId) {
      dispatch(setActiveConversation(userId));
      dispatch(getConversation(userId));
    }
  }, [dispatch, activeConversationId]);

  const handleConversationSelect = (conversation) => {
    const otherUserId = conversation._id;
    dispatch(setActiveConversation(otherUserId));
    dispatch(getConversation(otherUserId));
    dispatch(markAsRead(otherUserId));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!activeConversationId) return;

    try {
      await dispatch(sendMessage({
        receiverId: activeConversationId,
        content: messageText,
        attachments: attachments
      })).unwrap();

      setMessageText('');
      setAttachments([]);
      setShowAttachments(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUploaded = (fileData) => {
    setAttachments(prev => [...prev, fileData]);
  };

  const handleStartNewConversation = (selectedUser) => {
    // Check if user is in connections
    const isConnected = connections?.connections?.some(conn => conn._id === selectedUser._id);
    if (!isConnected) {
      alert('You can only message your connections. Please connect with this user first.');
      return;
    }

    dispatch(setActiveConversation(selectedUser._id));
    dispatch(getConversation(selectedUser._id));
    setShowNewMessageDialog(false);
    setSearchQuery('');
    setFilteredConnections([]);
  };

  const handleSearchUsers = () => {
    // Only show connected users for messaging
    if (searchQuery.trim()) {
      const filtered = connections?.connections?.filter(conn =>
        `${conn.firstName} ${conn.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

      setFilteredConnections(filtered);
    } else {
      setFilteredConnections([]);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString();
  };

  const formatDetailedTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `Active ${diffMinutes} minutes ago`;
    if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
    return `Last seen ${date.toLocaleDateString()}`;
  };

  // Fix: Handle case where conversation structure might be different
  const selectedConversation = activeConversationId ? {
    _id: activeConversationId,
    participant: connections?.connections?.find(conn => conn._id === activeConversationId)
  } : null;

  const getConversationName = (conversation) => {
    if (conversation?.participant) {
      return `${conversation.participant.firstName} ${conversation.participant.lastName}`;
    }
    if (conversation?.lastMessage?.sender?._id !== user?._id && conversation?.lastMessage?.sender?._id !== user?.id) {
      return `${conversation.lastMessage?.sender?.firstName} ${conversation.lastMessage?.sender?.lastName}`;
    }
    if (conversation?.lastMessage?.receiver?._id !== user?._id && conversation?.lastMessage?.receiver?._id !== user?.id) {
      return `${conversation.lastMessage?.receiver?.firstName} ${conversation.lastMessage?.receiver?.lastName}`;
    }
    // Fallback: find the connection name
    const connection = connections?.connections?.find(conn =>
      conn._id === activeConversationId ||
      conn._id === conversation?._id
    );
    if (connection) {
      return `${connection.firstName} ${connection.lastName}`;
    }
    return 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation?.participant) {
      return conversation.participant.profilePicture;
    }
    if (conversation?.lastMessage?.sender?._id !== user?._id && conversation?.lastMessage?.sender?._id !== user?.id) {
      return conversation.lastMessage?.sender?.profilePicture;
    }
    if (conversation?.lastMessage?.receiver?._id !== user?._id && conversation?.lastMessage?.receiver?._id !== user?.id) {
      return conversation.lastMessage?.receiver?.profilePicture;
    }
    // Fallback: find the connection avatar
    const connection = connections?.connections?.find(conn =>
      conn._id === activeConversationId ||
      conn._id === conversation?._id
    );
    return connection?.profilePicture || null;
  };

  const getConversationInitial = (conversation) => {
    if (conversation?.participant) {
      return conversation.participant.firstName?.[0];
    }
    if (conversation?.lastMessage?.sender?._id !== user?._id && conversation?.lastMessage?.sender?._id !== user?.id) {
      return conversation.lastMessage?.sender?.firstName?.[0];
    }
    if (conversation?.lastMessage?.receiver?._id !== user?._id && conversation?.lastMessage?.receiver?._id !== user?.id) {
      return conversation.lastMessage?.receiver?.firstName?.[0];
    }
    // Fallback: find the connection initial
    const connection = connections?.connections?.find(conn =>
      conn._id === activeConversationId ||
      conn._id === conversation?._id
    );
    return connection?.firstName?.[0] || 'U';
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

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
          <Message sx={{ mr: 2, color: '#667eea', fontSize: '2.5rem' }} />
          <Typography variant="h4" fontWeight="700" sx={{ color: '#2c3e50' }}>
            Messages
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary">
          Stay connected with your professional network
        </Typography>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ height: '600px' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Search and New Message */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  size="small"
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: '#667eea' }} />
                  }}
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
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => setShowNewMessageDialog(true)}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  New Message
                </Button>
              </Box>
            </Box>

            {/* Conversations List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Loading conversations...
                  </Typography>
                </Box>
              ) : conversations.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {conversations.map((conversation) => (
                    <ListItem
                      key={conversation._id}
                      button
                      onClick={() => handleConversationSelect(conversation)}
                      selected={activeConversationId === conversation._id}
                      sx={{
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #eef4ff 0%, #e3efff 100%)',
                          borderRight: '3px solid #667eea'
                        },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={conversation.unreadCount || 0}
                          color="primary"
                          invisible={!conversation.unreadCount}
                        >
                          <Avatar
                            src={getConversationAvatar(conversation)}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontWeight: 'bold'
                            }}
                          >
                            {getConversationInitial(conversation)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="600">
                            {getConversationName(conversation)}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {conversation.lastMessage?.content || 'Start a conversation'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {conversation.lastMessage?.createdAt && formatTime(conversation.lastMessage.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 3
                }}>
                  <Chat sx={{ fontSize: '3rem', color: '#667eea', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Start a conversation with your connections
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setShowNewMessageDialog(true)}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      }
                    }}
                  >
                    New Message
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{
                  p: 3,
                  borderBottom: '1px solid #e0e0e0',
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
                  borderRadius: '16px 16px 0 0'
                }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={getConversationAvatar(selectedConversation)}
                        sx={{
                          mr: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 'bold'
                        }}
                      >
                        {getConversationInitial(selectedConversation)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#2c3e50' }}>
                          {getConversationName(selectedConversation)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {selectedConversation?.participant ? 
                            'Online • Active now' : 
                            currentConversation.length > 0 ? 
                              formatDetailedTime(currentConversation[currentConversation.length - 1]?.createdAt) :
                              'Online • Start a conversation'
                          }
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton sx={{ mr: 1 }}>
                        <Phone />
                      </IconButton>
                      <IconButton sx={{ mr: 1 }}>
                        <VideoCall />
                      </IconButton>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>

                {/* Chat Messages */}
                <Box sx={{
                  flex: 1,
                  p: 3,
                  overflow: 'auto',
                  background: 'linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%)'
                }}>
                  {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        Loading messages...
                      </Typography>
                    </Box>
                  ) : currentConversation.length > 0 ? (
                    currentConversation.map((message, index) => (
                      <Box
                        key={message._id || index}
                        sx={{
                          mb: 2,
                          display: 'flex',
                          justifyContent: message.sender?._id === user?._id || message.sender?._id === user?.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '70%',
                            p: 2,
                            borderRadius: 3,
                            background: message.sender?._id === user?._id || message.sender?._id === user?.id
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'white',
                            color: message.sender?._id === user?._id || message.sender?._id === user?.id ? 'white' : '#2c3e50',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography variant="body2">
                            {message.content}
                          </Typography>
                          {message.attachments && message.attachments.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {message.attachments.map((attachment, idx) => (
                                <Chip
                                  key={idx}
                                  label={attachment.original_filename || 'Attachment'}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          )}
                          <Typography variant="caption" sx={{
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                            textAlign: 'right'
                          }}>
                            {formatTime(message.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="textSecondary">
                        {selectedConversation ?
                          `Start a conversation with ${getConversationName(selectedConversation)}` :
                          'No conversation selected'
                        }
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Attachments Section */}
                {showAttachments && (
                  <Box sx={{
                    p: 3,
                    borderTop: '1px solid #e0e0e0',
                    background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)'
                  }}>
                    <EnhancedFileUpload
                      onFileUploaded={handleFileUploaded}
                      allowedTypes={['image', 'video', 'document']}
                    />
                  </Box>
                )}

                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <Box sx={{
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                    background: '#f9f9f9',
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap'
                  }}>
                    {attachments.map((attachment, idx) => (
                      <Chip
                        key={idx}
                        label={attachment.original_filename || `${attachment.type} file`}
                        onDelete={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                        size="small"
                      />
                    ))}
                  </Box>
                )}

                {/* Message Input */}
                <Box sx={{
                  p: 3,
                  borderTop: '1px solid #e0e0e0',
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)'
                }}>
                  <Box display="flex" gap={1} alignItems="flex-end">
                    <IconButton
                      onClick={() => setShowAttachments(!showAttachments)}
                      sx={{
                        background: showAttachments ? 'rgba(102, 126, 234, 0.2)' : '#e0e0e0',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      <AttachFile />
                    </IconButton>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      multiline
                      maxRows={4}
                      disabled={sending}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: '#ffffff'
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <EmojiEmotions />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={(!messageText.trim() && attachments.length === 0) || sending}
                      sx={{
                        background: (messageText.trim() || attachments.length > 0) && !sending
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : '#e0e0e0',
                        color: 'white',
                        '&:hover': {
                          background: (messageText.trim() || attachments.length > 0) && !sending
                            ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                            : '#e0e0e0',
                        },
                        '&:disabled': {
                          color: '#999'
                        }
                      }}
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
              // No conversation selected
              <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box>
                  <Message sx={{ fontSize: '4rem', color: '#667eea', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                    Select a conversation
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: 400 }}>
                    Choose from your existing conversations or start a new one
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setShowNewMessageDialog(true)}
                    sx={{
                      borderRadius: 3,
                      px: 4,
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
                    Start New Conversation
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Message Dialog */}
      <Dialog
        open={showNewMessageDialog}
        onClose={() => setShowNewMessageDialog(false)}
        maxWidth="sm"
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
          Message Your Connections
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            placeholder="Search your connections..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearchUsers();
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#667eea' }} />
                </InputAdornment>
              )
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: '#fafbfc',
                '&:hover fieldset': {
                  borderColor: '#667eea'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea'
                }
              }
            }}
          />

          {connections?.connections?.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                No connections yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connect with people first to start messaging them
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
                {searchQuery ? 'Search Results' : 'Your Connections'}
              </Typography>
              {searchQuery && filteredConnections.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    No connections found matching "{searchQuery}"
                  </Typography>
                </Box>
              ) : (
                <List>
                  {(searchQuery ? filteredConnections : connections?.connections || []).map((connection) => (
                    <ListItem
                      key={connection._id}
                      button
                      onClick={() => handleStartNewConversation(connection)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={connection.profilePicture}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 'bold'
                          }}
                        >
                          {connection.firstName?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${connection.firstName} ${connection.lastName}`}
                        secondary={connection.headline || 'Professional'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Messages;
