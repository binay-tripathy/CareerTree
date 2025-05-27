# Career Tree - LinkedIn Clone

A full-stack LinkedIn clone built with React (client) and Node.js/Express (server).

## Project Structure

```
career-tree/
├── server/            # Node.js/Express API server
│   ├── config/        # Database configuration
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   └── server.js      # Main server file
├── client/            # React application
└── package.json       # Root package.json for scripts
```

## Features

- User authentication (register/login)
- User profiles with experience and education
- Post creation and viewing
- Real-time features with Socket.io
- Image upload with Cloudinary
- MongoDB database integration

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Community Server
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd career-tree
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

3. **Setup MongoDB:**
   - Start MongoDB service
   - Database will be created automatically

4. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env`
   - Update the values as needed

### Development

1. **Start both client and server:**
   ```bash
   npm run dev
   ```

2. **Or start them separately:**
   ```bash
   # Server only (port 5000)
   npm run dev:server
   
   # Client only (port 3000/5173)
   npm run dev:client
   ```

3. **Test server API:**
   ```bash
   npm run test:server
   ```

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts

### Environment Variables

Create `server/.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/career-tree
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
PORT=5000
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
