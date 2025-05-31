import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get conversations
export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

// Get conversation with specific user
export const getConversation = createAsyncThunk(
  'messages/getConversation',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return { userId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation');
    }
  }
);

// Send message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ receiverId, content, attachments = [] }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/messages/send`, {
        receiverId,
        content,
        attachments
      }, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Mark messages as read
export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await axios.put(`${API_URL}/messages/mark-read/${userId}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    currentConversation: [],
    activeConversationId: null,
    loading: false,
    sending: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      state.error = null; // Clear any previous errors
    },
    clearActiveConversation: (state) => {
      state.activeConversationId = null;
      state.currentConversation = [];
    },
    addMessage: (state, action) => {
      const message = action.payload;
      if (state.activeConversationId === message.sender._id || 
          state.activeConversationId === message.receiver._id) {
        state.currentConversation.push(message);
      }
      
      // Update conversations list
      const convIndex = state.conversations.findIndex(conv => 
        conv._id === message.sender._id || conv._id === message.receiver._id
      );
      
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        if (message.receiver._id === state.activeConversationId) {
          state.conversations[convIndex].unreadCount = (state.conversations[convIndex].unreadCount || 0) + 1;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get conversations
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
        state.unreadCount = action.payload.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get conversation
      .addCase(getConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload.messages;
        state.activeConversationId = action.payload.userId;
        state.error = null;
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear activeConversationId on error, just show the error
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.currentConversation.push(action.payload);
        
        // Update conversations list with new timestamp
        const convIndex = state.conversations.findIndex(conv => 
          conv._id === action.payload.receiver._id
        );
        
        if (convIndex !== -1) {
          state.conversations[convIndex].lastMessage = action.payload;
          // Move to top with current timestamp
          const conv = state.conversations.splice(convIndex, 1)[0];
          state.conversations.unshift(conv);
        } else {
          // Create new conversation entry if it doesn't exist
          state.conversations.unshift({
            _id: action.payload.receiver._id,
            participant: action.payload.receiver,
            lastMessage: action.payload,
            unreadCount: 0
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const convIndex = state.conversations.findIndex(conv => conv._id === action.payload);
        if (convIndex !== -1) {
          state.conversations[convIndex].unreadCount = 0;
        }
        state.unreadCount = state.conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
      });
  },
});

export const { setActiveConversation, clearActiveConversation, addMessage, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
