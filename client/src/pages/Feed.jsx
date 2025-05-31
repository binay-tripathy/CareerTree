import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Alert,
  Chip,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Image,
  VideoCall,
  Article,
  TrendingUp,
  Delete,
  PictureAsPdf,
} from '@mui/icons-material';
import { fetchPosts, createPost, likePost } from '../store/postsSlice';
import PostCard from '../components/PostCard';
import EnhancedFileUpload from '../components/EnhancedFileUpload';

const Feed = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [postContent, setPostContent] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [postImage, setPostImage] = useState('');
  const [uploadType, setUploadType] = useState('image');
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleCreatePost = async () => {
    if (postContent.trim() || postImage) {
      try {
        await dispatch(createPost({ 
          content: postContent,
          image: postImage,
          fileInfo: uploadedFileInfo // Include file info in post data
        })).unwrap();
        setPostContent('');
        setPostImage('');
        setUploadedFileInfo(null);
        setShowFileUpload(false);
      } catch (error) {
        console.error('Failed to create post:', error);
      }
    }
  };

  const handleFileUploaded = (fileData) => {
    setPostImage(fileData.url);
    setShowFileUpload(false);
    // Store additional file info for better rendering
    setUploadedFileInfo(fileData);
  };

  const handleUploadTypeChange = (type) => {
    setUploadType(type);
    setShowFileUpload(!showFileUpload);
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    console.log('Download file URL:', fileUrl);
    
    // Handle mock file URLs
    if (fileUrl.startsWith('mock-file://')) {
      const filename = fileUrl.replace('mock-file://', '');
      const storedFile = sessionStorage.getItem(`file_${filename}`);
      if (storedFile) {
        fileUrl = storedFile; // Use the stored base64 data
      } else {
        alert('File not found in session. Please re-upload the file.');
        return;
      }
    }
    
    // Check if it's our custom document scheme and handle it
    if (fileUrl.startsWith('document://')) {
      alert('This file format is not supported for download in demo mode. Please use actual file upload service.');
      return;
    }
    
    if (fileUrl.startsWith('data:')) {
      try {
        // Extract the base64 data and MIME type
        const [header, base64Data] = fileUrl.split(',');
        if (!header || !base64Data) {
          throw new Error('Invalid data URL format');
        }
        
        const mimeTypeMatch = header.match(/:(.*?);/);
        if (!mimeTypeMatch) {
          throw new Error('Could not extract MIME type');
        }
        
        const mimeType = mimeTypeMatch[1];
        
        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and download
        const blob = new Blob([bytes], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'document';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
        
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed: ' + error.message);
      }
    } else {
      // Handle regular URLs
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenFile = (fileUrl) => {
    console.log('Open file URL:', fileUrl);
    
    // Handle mock file URLs
    if (fileUrl.startsWith('mock-file://')) {
      const filename = fileUrl.replace('mock-file://', '');
      const storedFile = sessionStorage.getItem(`file_${filename}`);
      if (storedFile) {
        fileUrl = storedFile; // Use the stored base64 data
      } else {
        alert('File not found in session. Please re-upload the file.');
        return;
      }
    }
    
    // Check if it's our custom document scheme and handle it
    if (fileUrl.startsWith('document://')) {
      alert('This file format is not supported for viewing in demo mode. Please use actual file upload service.');
      return;
    }
    
    if (fileUrl.startsWith('data:')) {
      try {
        // Extract the base64 data and MIME type
        const [header, base64Data] = fileUrl.split(',');
        if (!header || !base64Data) {
          throw new Error('Invalid data URL format');
        }
        
        const mimeTypeMatch = header.match(/:(.*?);/);
        if (!mimeTypeMatch) {
          throw new Error('Could not extract MIME type');
        }
        
        const mimeType = mimeTypeMatch[1];
        
        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and open in new tab
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        const newWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
          // If popup blocked, try downloading instead
          alert('Popup blocked. The file will be downloaded instead.');
          handleDownloadFile(fileUrl, 'document');
        } else {
          // Clean up blob URL after some time
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        }
        
      } catch (error) {
        console.error('Open failed:', error);
        alert('Unable to open file: ' + error.message);
      }
    } else {
      // Handle regular URLs
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderMediaPreview = () => {
    if (!postImage || !uploadedFileInfo) return null;

    const { file_type, original_filename, bytes } = uploadedFileInfo;

    if (file_type?.startsWith('video/')) {
      return (
        <video
          src={postImage}
          controls
          style={{ 
            width: '100%', 
            maxHeight: '300px', 
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            backgroundColor: '#000'
          }}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (file_type?.startsWith('image/')) {
      return (
        <img
          src={postImage}
          alt="Preview"
          style={{ 
            width: '100%', 
            maxHeight: '300px', 
            minHeight: '200px',
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}
          onError={(e) => {
            console.error('Image load error:', e);
            e.target.style.display = 'none';
          }}
        />
      );
    } else {
      // Document preview
      const isPDF = file_type.includes('pdf');
      const isWord = file_type.includes('word') || file_type.includes('msword') || file_type.includes('document');
      const isExcel = file_type.includes('excel') || file_type.includes('spreadsheet');
      const isLargeFile = bytes > 5 * 1024 * 1024; // 5MB

      return (
        <Box sx={{
          p: 4,
          border: '2px solid #e3f2fd',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          minWidth: '400px',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#667eea',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
            transform: 'translateY(-2px)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <PictureAsPdf sx={{ 
              mr: 3, 
              color: isPDF ? '#f44336' : isWord ? '#2196f3' : isExcel ? '#4caf50' : '#9c27b0', 
              fontSize: '2.5rem' 
            }} />
            <Box>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#2c3e50' }}>
                {original_filename || 'Document'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isPDF ? 'PDF Document' : 
                 isWord ? 'Word Document' :
                 isExcel ? 'Excel Spreadsheet' :
                 'Document'} • {Math.round(bytes / 1024)} KB
              </Typography>
              <Typography variant="caption" sx={{ 
                color: isLargeFile ? '#ff9800' : '#667eea', 
                fontWeight: 600 
              }}>
                {isLargeFile ? 'Large file - stored locally' : 'Ready to upload'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Opening file:', postImage);
                handleOpenFile(postImage);
              }}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
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
                console.log('Downloading file:', postImage, original_filename);
                handleDownloadFile(postImage, original_filename);
              }}
              sx={{
                borderRadius: 3,
                borderColor: '#667eea',
                color: '#667eea',
                borderWidth: 2,
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: '#5a6fd8',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderWidth: 2
                }
              }}
            >
              Download
            </Button>
          </Box>
        </Box>
      );
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#2c3e50' }}>
          Loading your feed...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Main Feed */}
        <Grid item xs={12} md={8}>
          {/* Create Post */}
          <Paper sx={{ p: 4, mb: 3, borderRadius: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#2c3e50' }}>
              Share your thoughts
            </Typography>
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Avatar 
                src={user?.profilePicture} 
                sx={{ mr: 2 }}
              >
                {user?.firstName?.[0] || 'U'}
              </Avatar>
              <TextField
                fullWidth
                placeholder="What's on your mind?"
                variant="outlined"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                multiline
                rows={3}
              />
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <IconButton onClick={() => handleUploadTypeChange('image')}>
                  <Image />
                </IconButton>
                <IconButton onClick={() => handleUploadTypeChange('video')}>
                  <VideoCall />
                </IconButton>
                <IconButton onClick={() => handleUploadTypeChange('document')}>
                  <Article />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                onClick={handleCreatePost}
                disabled={(!postContent.trim() && !postImage) || loading}
              >
                Post
              </Button>
            </Box>

            {/* File Upload Section */}
            <Collapse in={showFileUpload}>
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Upload {uploadType}
                </Typography>
                <EnhancedFileUpload 
                  onFileUploaded={handleFileUploaded}
                  allowedTypes={[uploadType]}
                />
              </Box>
            </Collapse>

            {/* Media Preview */}
            {postImage && (
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Preview:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  {renderMediaPreview()}
                  <IconButton
                    onClick={() => {
                      setPostImage('');
                      setUploadedFileInfo(null);
                    }}
                    sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.8)' }}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Posts */}
          {posts.length === 0 && !loading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No posts yet
              </Typography>
            </Paper>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Profile
            </Typography>
            <Box textAlign="center">
              <Avatar src={user?.profilePicture} sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                {user?.firstName?.[0] || 'U'}
              </Avatar>
              <Typography variant="h6">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.headline || 'Add a headline'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Feed;
