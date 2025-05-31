require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"]
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increased limits for file uploads
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = '[HIDDEN]';
    console.log('Request body:', logBody);
  }
  next();
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career-tree';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Continuing without database for testing...');
  }
};

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Career Tree Backend API is running!' });
});

// API Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.log('⚠️  Auth routes not found, creating placeholder...');
  app.post('/api/auth/register', (req, res) => {
    res.status(501).json({ message: 'Register endpoint not implemented yet' });
  });
  app.post('/api/auth/login', (req, res) => {
    res.status(501).json({ message: 'Login endpoint not implemented yet' });
  });
  app.get('/api/auth/me', (req, res) => {
    res.status(501).json({ message: 'User profile endpoint not implemented yet' });
  });
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ Users routes loaded');
} catch (err) {
  console.log('⚠️  Users routes not found, creating placeholder...');
  app.get('/api/users/me', (req, res) => {
    res.status(501).json({ message: 'User profile endpoint not implemented yet' });
  });
  app.put('/api/users/profile', (req, res) => {
    res.status(501).json({ message: 'Update profile endpoint not implemented yet' });
  });
  app.get('/api/users/search', (req, res) => {
    res.status(501).json({ message: 'User search endpoint not implemented yet' });
  });
}

try {
  app.use('/api/posts', require('./routes/posts'));
  console.log('✅ Posts routes loaded');
} catch (err) {
  console.log('⚠️  Posts routes not found, creating placeholder...');
  app.get('/api/posts', (req, res) => {
    res.status(501).json({ message: 'Posts endpoint not implemented yet' });
  });
  app.post('/api/posts', (req, res) => {
    res.status(501).json({ message: 'Create post endpoint not implemented yet' });
  });
  app.put('/api/posts/:id/like', (req, res) => {
    res.status(501).json({ message: 'Like post endpoint not implemented yet' });
  });
}

try {
  app.use('/api/messages', require('./routes/messages'));
  console.log('✅ Messages routes loaded');
} catch (err) {
  console.log('⚠️  Messages routes not found, creating placeholder...');
  app.get('/api/messages/conversations', (req, res) => {
    res.status(501).json({ message: 'Conversations endpoint not implemented yet' });
  });
  app.post('/api/messages/send', (req, res) => {
    res.status(501).json({ message: 'Send message endpoint not implemented yet' });
  });
}

try {
  app.use('/api/connections', require('./routes/connections'));
  console.log('✅ Connections routes loaded');
} catch (err) {
  console.log('⚠️  Connections routes not found, creating placeholder...');
  app.get('/api/connections/my-connections', (req, res) => {
    res.status(501).json({ message: 'Connections endpoint not implemented yet' });
  });
  app.post('/api/connections/request/:userId', (req, res) => {
    res.status(501).json({ message: 'Connection request endpoint not implemented yet' });
  });
}

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

// Start server with timeout configuration
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📋 Available API endpoints:');
  console.log('   - POST /api/auth/register');
  console.log('   - POST /api/auth/login');
  console.log('   - GET /api/auth/me');
  console.log('   - GET /api/users/me');
  console.log('   - GET /api/posts');
  console.log('   - POST /api/posts');
  console.log('   - PUT /api/posts/:id/like');
  console.log('   - GET /api/messages/conversations');
  console.log('   - POST /api/messages/send');
  console.log('   - GET /api/connections/my-connections');
  console.log('   - POST /api/connections/request/:userId');
});

// Increase timeout for large file uploads
server.timeout = 300000; // 5 minutes

module.exports = app;