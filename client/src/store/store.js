import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postsReducer from './postsSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
  },
});
