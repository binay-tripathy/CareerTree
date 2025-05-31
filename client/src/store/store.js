import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postsReducer from './postsSlice';
import usersReducer from './usersSlice';
import messagesReducer from './messagesSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    messages: messagesReducer,
  },
});
