import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/posts/feed`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Check if the payload is too large (rough estimate)
      const payloadSize = JSON.stringify(postData).length;
      if (payloadSize > 50 * 1024 * 1024) { // 50MB in characters
        throw new Error('Post content is too large. Please use smaller files.');
      }
      
      const response = await axios.post(`${API_URL}/posts`, postData, {
        headers: { 
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000, // 2 minutes timeout
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024 // 100MB
      });
      return response.data;
    } catch (error) {
      console.error('Create post error:', error.response?.data || error.message);
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Upload timeout. Please try with a smaller file.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/posts/${postId}/comment`, 
        { text: text.trim() }, 
        {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Add comment error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(`${API_URL}/posts/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Delete comment error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { postId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create post';
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(addComment.pending, (state) => {
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add comment';
      })
      .addCase(deleteComment.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete comment';
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.posts.filter(post => post._id !== action.payload.postId);
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete post';
      });
  },
});

export const { clearError } = postsSlice.actions;
export default postsSlice.reducer;
