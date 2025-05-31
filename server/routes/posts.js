const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image, fileInfo } = req.body;
    
    if (!content?.trim() && !image?.trim()) {
      return res.status(400).json({ message: 'Post must have content or media' });
    }
    
    const post = new Post({
      author: req.user._id,
      content: content?.trim() || '',
      image: image?.trim() || '',
      fileInfo: fileInfo || null,
      createdAt: new Date()
    });
    
    await post.save();
    await post.populate('author', 'firstName lastName profilePicture headline');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName profilePicture')
      .populate('comments.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get posts for feed
router.get('/feed', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(like => like.user.toString() === req.user._id.toString());
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();
    await post.populate('author', 'firstName lastName profilePicture headline');
    await post.populate('comments.user', 'firstName lastName profilePicture');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Populate the post with all required fields
    await post.populate([
      { path: 'author', select: 'firstName lastName profilePicture headline' },
      { path: 'comments.user', select: 'firstName lastName profilePicture' }
    ]);
    
    res.json(post);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is authorized to delete this comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    post.comments.pull(req.params.commentId);
    await post.save();

    // Populate the post with all required fields
    await post.populate([
      { path: 'author', select: 'firstName lastName profilePicture headline' },
      { path: 'comments.user', select: 'firstName lastName profilePicture' }
    ]);
    
    res.json(post);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully', postId: req.params.id });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
