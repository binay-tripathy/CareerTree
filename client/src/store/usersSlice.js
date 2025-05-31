import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/users/profile`, userData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (query, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

export const getConnections = createAsyncThunk(
  'users/getConnections',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/connections/my-connections`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch connections');
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  'users/sendConnectionRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/connections/request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send connection request');
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  'users/acceptConnectionRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/connections/accept/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept connection request');
    }
  }
);

export const rejectConnectionRequest = createAsyncThunk(
  'users/rejectConnectionRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/connections/reject/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject connection request');
    }
  }
);

export const cancelConnectionRequest = createAsyncThunk(
  'users/cancelConnectionRequest',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(`${API_URL}/connections/cancel/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { userId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel connection request');
    }
  }
);

export const uploadFile = createAsyncThunk(
  'users/uploadFile',
  async ({ file, type = 'image' }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use different upload presets based on file type
      if (type === 'video') {
        formData.append('upload_preset', 'career_tree_video');
        formData.append('resource_type', 'video');
      } else if (type === 'document') {
        formData.append('upload_preset', 'career_tree_docs');
        formData.append('resource_type', 'raw');
      } else {
        formData.append('upload_preset', 'career_tree_images');
        formData.append('resource_type', 'image');
      }
      
      const cloudName = 'your-cloud-name'; // Replace with your Cloudinary cloud name
      const resourceType = type === 'video' ? 'video' : type === 'document' ? 'raw' : 'image';
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // You can dispatch progress updates here if needed
          }
        }
      );
      
      return {
        url: response.data.secure_url,
        type: type,
        public_id: response.data.public_id,
        format: response.data.format,
        bytes: response.data.bytes,
        original_filename: response.data.original_filename
      };
    } catch (error) {
      return rejectWithValue('Failed to upload file');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    searchResults: [],
    connections: {
      connections: [],
      sentRequests: [],
      receivedRequests: []
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(getConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        // Add to sent requests locally
        state.connections.sentRequests.push({
          user: { _id: action.payload.userId },
          sentAt: new Date().toISOString()
        });
      })
      .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
        // Remove from received requests and refresh connections
        state.connections.receivedRequests = state.connections.receivedRequests.filter(
          req => req.user._id !== action.payload.userId
        );
      })
      .addCase(rejectConnectionRequest.fulfilled, (state, action) => {
        // Remove from received requests
        state.connections.receivedRequests = state.connections.receivedRequests.filter(
          req => req.user._id !== action.payload.userId
        );
      })
      .addCase(cancelConnectionRequest.fulfilled, (state, action) => {
        // Remove from sent requests
        state.connections.sentRequests = state.connections.sentRequests.filter(
          req => req.user._id !== action.payload.userId
        );
      })
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.uploadProgress = 0;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadProgress = 0;
      });
  },
});

export const { clearSearchResults, clearError, setUploadProgress } = usersSlice.actions;
export default usersSlice.reducer;
