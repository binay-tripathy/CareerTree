import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  ThumbUp,
  Comment,
  Share,
  Image,
  VideoCall,
  Article,
} from '@mui/icons-material';
import { fetchPosts, createPost, likePost } from '../store/postsSlice';

const Feed = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [postContent, setPostContent] = React.useState('');

  useEffect(() => {
    // Only fetch posts if backend is connected
    // For now, just show the UI
    console.log('Feed loaded');
  }, [dispatch]);

  const handleCreatePost = () => {
    if (postContent.trim()) {
      // For now, just clear the content
      console.log('Creating post:', postContent);
      setPostContent('');
    }
  };

  const handleLike = (postId) => {
    console.log('Liking post:', postId);
  };

  // Mock posts for display if no real posts
  const mockPosts = posts.length === 0 ? [
    {
      _id: '1',
      author: {
        firstName: 'John',
        lastName: 'Doe',
        profilePicture: '',
        headline: 'Software Engineer'
      },
      content: 'Welcome to Career Tree! This is a sample post.',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    }
  ] : posts;

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error} - Showing demo content
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box textAlign="center">
              <Avatar
                src={user?.profilePicture}
                sx={{ width: 72, height: 72, mx: 'auto', mb: 2 }}
              >
                {user?.firstName?.[0] || 'U'}
              </Avatar>
              <Typography variant="h6">
                {user?.firstName || 'User'} {user?.lastName || ''}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.headline || 'Add a headline'}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="primary">
              Connections: {user?.connections?.length || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Main Feed */}
        <Grid item xs={12} md={6}>
          {/* Create Post */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar src={user?.profilePicture} sx={{ mr: 2 }}>
                {user?.firstName?.[0] || 'U'}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Start a post"
                variant="outlined"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <IconButton color="primary">
                  <Image />
                </IconButton>
                <IconButton color="primary">
                  <VideoCall />
                </IconButton>
                <IconButton color="primary">
                  <Article />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
              >
                Post
              </Button>
            </Box>
          </Paper>

          {/* Posts */}
          {mockPosts.map((post) => (
            <Card key={post._id} sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={post.author?.profilePicture} sx={{ mr: 2 }}>
                    {post.author?.firstName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {post.author?.firstName} {post.author?.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {post.author?.headline}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                {post.image && (
                  <Box component="img" src={post.image} sx={{ width: '100%', mb: 2 }} />
                )}
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-around' }}>
                <Button
                  startIcon={<ThumbUp />}
                  onClick={() => handleLike(post._id)}
                  color={post.likes?.includes(user?.id) ? 'primary' : 'inherit'}
                >
                  Like ({post.likes?.length || 0})
                </Button>
                <Button startIcon={<Comment />}>
                  Comment ({post.comments?.length || 0})
                </Button>
                <Button startIcon={<Share />}>
                  Share
                </Button>
              </CardActions>
            </Card>
          ))}
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>
              Trending News
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Latest industry updates and trends
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Feed;
