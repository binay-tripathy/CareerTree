import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Divider,
  Collapse,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Share,
  MoreVert,
  Delete,
  PictureAsPdf,
  ExpandMore,
  Send,
  GetApp,
  OpenInNew,
} from '@mui/icons-material';
import { addComment, deleteComment, likePost, deletePost } from '../store/postsSlice';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Check if current user is the author of the post
  const isAuthor = user?._id === post.author._id || user?.id === post.author._id;
  
  // Check if current user liked the post
  const isLiked = post.likes?.some(like => 
    like.user === user?._id || like.user === user?.id
  );

  // Add formatTime function
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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deletePost(post._id)).unwrap();
        setAnchorEl(null);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleLike = async () => {
    try {
      await dispatch(likePost(post._id));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async () => {
    if (commentText.trim()) {
      try {
        await dispatch(addComment({ postId: post._id, text: commentText }));
        setCommentText('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await dispatch(deleteComment({ postId: post._id, commentId }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.author.firstName} ${post.author.lastName} - Career Tree`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Post link copied to clipboard!');
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    // Check if it's a base64 data URL
    if (fileUrl.startsWith('data:')) {
      // For base64 files, create blob and download
      try {
        const base64Data = fileUrl.split(',')[1];
        const mimeType = fileUrl.split(',')[0].split(':')[1].split(';')[0];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
      }
    } else {
      // For regular URLs
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenFile = (fileUrl) => {
    if (fileUrl.startsWith('data:')) {
      // For base64 files, create blob URL and open
      try {
        const base64Data = fileUrl.split(',')[1];
        const mimeType = fileUrl.split(',')[0].split(':')[1].split(';')[0];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (error) {
        console.error('Open failed:', error);
        alert('Unable to open file. Please try downloading instead.');
      }
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const renderPostMedia = () => {
    if (!post.image) return null;

    // Use fileInfo if available for better type detection
    const fileInfo = post.fileInfo;
    const fileUrl = post.image;

    // Check for video files
    if (fileInfo?.file_type?.startsWith('video/') || fileUrl.startsWith('data:video/')) {
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <video
            src={fileUrl}
            controls
            style={{ 
              width: '100%',
              maxHeight: '500px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              backgroundColor: '#000'
            }}
            onError={(e) => {
              console.error('Video load error:', e);
              e.target.style.display = 'none';
            }}
          >
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }

    // Check for document files
    if (fileInfo?.file_type && !fileInfo.file_type.startsWith('image/') && !fileInfo.file_type.startsWith('video/')) {
      const isPDF = fileInfo.file_type.includes('pdf');
      const isWord = fileInfo.file_type.includes('word') || fileInfo.file_type.includes('msword') || fileInfo.file_type.includes('document');
      const isExcel = fileInfo.file_type.includes('excel') || fileInfo.file_type.includes('spreadsheet');
      
      return (
        <Box sx={{
          p: 4,
          border: '2px solid #e3f2fd',
          borderRadius: 4,
          mt: 2,
          mb: 2,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#667eea',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
            transform: 'translateY(-4px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <PictureAsPdf sx={{ 
              mr: 3, 
              color: isPDF ? '#f44336' : isWord ? '#2196f3' : isExcel ? '#4caf50' : '#9c27b0', 
              fontSize: '3rem' 
            }} />
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#2c3e50', mb: 0.5 }}>
                {fileInfo.original_filename || 'Document'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                {isPDF ? 'PDF Document' : 
                 isWord ? 'Word Document' :
                 isExcel ? 'Excel Spreadsheet' :
                 'Document'} • {Math.round((fileInfo.bytes || 0) / 1024)} KB
              </Typography>
              <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 600 }}>
                Click to view or download
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenFile(fileUrl);
              }}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Open
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadFile(fileUrl, fileInfo.original_filename);
              }}
              sx={{
                borderRadius: 3,
                borderColor: '#667eea',
                color: '#667eea',
                px: 3,
                py: 1,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderColor: '#5a6fd8',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderWidth: 2,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
      );
    }

    // Default image rendering with larger size
    return (
      <Box sx={{ mt: 2, mb: 2 }}>
        <img
          src={fileUrl}
          alt="Post content"
          style={{
            width: '100%',
            maxHeight: '600px',
            minHeight: '300px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            console.error('Image load error:', e);
            e.target.style.display = 'none';
          }}
          onClick={() => window.open(fileUrl, '_blank')}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'
          }
        />
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 4 }}>
      <CardHeader
        avatar={
          <Avatar 
            src={post.author.profilePicture}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold'
            }}
          >
            {post.author.firstName?.[0] || 'U'}
          </Avatar>
        }
        action={
          isAuthor && (
            <Box>
              <IconButton onClick={handleMenuClick}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleDeletePost} sx={{ color: '#f44336' }}>
                  <Delete sx={{ mr: 1 }} />
                  Delete Post
                </MenuItem>
              </Menu>
            </Box>
          )
        }
        title={
          <Typography variant="h6" fontWeight="600">
            {post.author.firstName} {post.author.lastName}
          </Typography>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="textSecondary">
              {post.author.headline || 'Professional'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatTime(post.createdAt)}
            </Typography>
          </Box>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          {post.content}
        </Typography>
        
        {/* Render media (image, video, or document) */}
        {renderPostMedia()}
      </CardContent>
      
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button
          startIcon={<ThumbUp />}
          onClick={handleLike}
          sx={{
            color: isLiked ? '#667eea' : 'inherit',
            fontWeight: isLiked ? '600' : 'normal'
          }}
        >
          {post.likes?.length || 0}
        </Button>
        <Button
          startIcon={<Comment />}
          onClick={() => setShowComments(!showComments)}
          sx={{ color: showComments ? '#667eea' : 'inherit' }}
        >
          {post.comments?.length || 0}
        </Button>
        <Button
          startIcon={<Share />}
          onClick={handleShare}
        >
          Share
        </Button>
      </CardActions>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ p: 3 }}>
          {/* Comment Input */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar
              src={user?.profilePicture}
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '0.9rem'
              }}
            >
              {user?.firstName?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                variant="outlined"
                size="small"
                multiline
                maxRows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    background: '#f8f9fa'
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleComment}
                disabled={!commentText.trim()}
                sx={{
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  minWidth: 'auto',
                  px: 2
                }}
              >
                <Send />
              </Button>
            </Box>
          </Box>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <List sx={{ p: 0 }}>
              {post.comments.map((comment) => (
                <ListItem
                  key={comment._id}
                  alignItems="flex-start"
                  sx={{
                    p: 0,
                    mb: 2,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={comment.user?.profilePicture}
                      sx={{
                        width: 32,
                        height: 32,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '0.9rem'
                      }}
                    >
                      {comment.user?.firstName?.[0] || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{
                        background: '#f8f9fa',
                        borderRadius: 3,
                        p: 2,
                        position: 'relative'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
                              {comment.user?.firstName} {comment.user?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {comment.text}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatTime(comment.createdAt)}
                            </Typography>
                          </Box>
                          {(user?._id === comment.user?._id || user?.id === comment.user?._id) && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteComment(comment._id)}
                              sx={{
                                ml: 1,
                                color: '#f44336',
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 0.1)'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;
