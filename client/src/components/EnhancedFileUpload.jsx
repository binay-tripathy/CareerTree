import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, Image, VideoFile, PictureAsPdf, InsertDriveFile } from '@mui/icons-material';

// Use import.meta.env for Vite instead of process.env
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const EnhancedFileUpload = ({ onFileUploaded, allowedTypes = ['image'] }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const fileTypes = {
    image: { accept: 'image/*', maxSize: 10 * 1024 * 1024, label: 'Images' },
    video: { accept: 'video/*', maxSize: 100 * 1024 * 1024, label: 'Videos' },
    document: { accept: '.pdf,.doc,.docx,.txt', maxSize: 25 * 1024 * 1024, label: 'Documents' }
  };

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (fileType, file) => {
    switch (fileType) {
      case 'image':
        return <Image sx={{ fontSize: '2rem', color: '#4CAF50' }} />;
      case 'video':
        return <VideoFile sx={{ fontSize: '2rem', color: '#f44336' }} />;
      case 'document':
        if (file.type === 'application/pdf') {
          return <PictureAsPdf sx={{ fontSize: '2rem', color: '#f44336' }} />;
        }
        return <InsertDriveFile sx={{ fontSize: '2rem', color: '#2196F3' }} />;
      default:
        return <CloudUpload sx={{ fontSize: '2rem', color: '#667eea' }} />;
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB to avoid server issues)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size must be less than 5MB. Please choose a smaller file or compress it.');
      return;
    }
    
    setSelectedFile(file);
    
    // Validate file type
    if (!isValidFileType(file)) {
      setError(`Please select a valid ${allowedTypes.join('/')} file.`);
      return;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }
    
    setError(null);
    
    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);

    try {
      // Check file size again before upload
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Mock upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Convert to base64
      const fileUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(selectedFile);
      });
      
      // Call the callback with the file data
      onFileUploaded({
        url: fileUrl,
        public_id: `mock_${Date.now()}`,
        resource_type: selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'raw',
        format: selectedFile.type.split('/')[1] || 'unknown',
        original_filename: selectedFile.name,
        bytes: selectedFile.size,
        file_type: selectedFile.type
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again with a smaller file.');
    } finally {
      setUploading(false);
    }
  };

  // Real Cloudinary upload function (use this once preset is configured)
  const handleCloudinaryUpload = async () => {
    if (!selectedFile) return;
    
    if (!CLOUDINARY_CLOUD_NAME) {
      setError('Cloudinary cloud name not configured.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'ml_default'); // Use default unsigned preset
      
      // Determine resource type
      let endpoint = 'image';
      if (allowedTypes.includes('video') && selectedFile.type.startsWith('video/')) {
        endpoint = 'video';
      } else if (allowedTypes.includes('document')) {
        endpoint = 'raw';
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary error:', errorData);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      onFileUploaded({
        url: data.secure_url,
        public_id: data.public_id,
        resource_type: data.resource_type,
        format: data.format,
        original_filename: data.original_filename,
        bytes: data.bytes
      });

      // Reset component state
      setSelectedFile(null);
      setPreviewUrl(null);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptString = () => {
    const acceptMap = {
      image: 'image/*',
      video: 'video/*',
      document: '.pdf,.doc,.docx,.txt'
    };
    
    return allowedTypes.map(type => acceptMap[type] || '*/*').join(',');
  };

  const isValidFileType = (file) => {
    if (allowedTypes.includes('image') && file.type.startsWith('image/')) return true;
    if (allowedTypes.includes('video') && file.type.startsWith('video/')) return true;
    if (allowedTypes.includes('document')) {
      const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return documentTypes.includes(file.type);
    }
    return false;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={getAcceptString()}
        style={{ display: 'none' }}
      />
      
      {!selectedFile ? (
        <Button
          variant="outlined"
          onClick={handleButtonClick}
          startIcon={<CloudUpload />}
          fullWidth
          sx={{
            py: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              borderColor: '#5a6fd8',
              background: 'rgba(102, 126, 234, 0.1)'
            }
          }}
        >
          Select {allowedTypes.join('/')} to upload
        </Button>
      ) : (
        <Box>
          {previewUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
              />
            </Box>
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Selected: {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              {uploading ? <CircularProgress size={20} color="inherit" /> : 'Upload'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setError(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default EnhancedFileUpload;
