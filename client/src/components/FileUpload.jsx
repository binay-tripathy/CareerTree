import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { CloudUpload, Delete, Image } from '@mui/icons-material';
import { uploadFile } from '../store/usersSlice';

const FileUpload = ({ onFileUploaded, accept = "image/*", maxSize = 5 * 1024 * 1024 }) => {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setError('');
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedUrl = await dispatch(uploadFile(selectedFile)).unwrap();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onFileUploaded(uploadedUrl);
      handleClear();
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadProgress(0);
    setError('');
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {!selectedFile ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            border: '2px dashed #e0e0e0',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#667eea',
              background: 'linear-gradient(135deg, #eef4ff 0%, #e3efff 100%)',
            }
          }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <CloudUpload sx={{ fontSize: '3rem', color: '#667eea', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: '#2c3e50' }}>
            Choose a file to upload
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Drag and drop or click to browse
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Image sx={{ mr: 2, color: '#667eea' }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClear} sx={{ color: '#ff6b6b' }}>
              <Delete />
            </IconButton>
          </Box>

          {previewUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              />
            </Box>
          )}

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ 
                  borderRadius: 2,
                  height: 8,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }
                }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Uploading... {uploadProgress}%
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            fullWidth
            sx={{
              borderRadius: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: '600',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              '&:disabled': {
                background: '#e0e0e0'
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default FileUpload;
