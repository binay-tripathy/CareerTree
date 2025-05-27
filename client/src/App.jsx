import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Network from './pages/Network';
import { loadUser, setLoading } from './store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser());
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f3f2ef'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f3f2ef' }}>
      {isAuthenticated && <Header />}
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/feed" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/feed" />} 
        />
        <Route 
          path="/feed" 
          element={isAuthenticated ? <Feed /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile/:id?" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/messages" 
          element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/network" 
          element={isAuthenticated ? <Network /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/feed" : "/login"} />} />
      </Routes>
    </Box>
  );
}

export default App;
