const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    
    const post = new Post({
      author: req.user._id,
      content,
      image
    });
    
    await post.save();
    await post.populate('author', 'firstName lastName profilePicture');
    
    res.status(201).json(post);
  } catch (error) {
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

module.exports = router;
