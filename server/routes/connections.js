const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send connection request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add to current user's following
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    });

    // Add to target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.json({ message: 'Connection request sent' });
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept connection (add to connections)
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const requesterId = req.params.userId;
    const currentUserId = req.user.userId;

    // Add to both users' connections
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { connections: requesterId }
    });

    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { connections: currentUserId }
    });

    res.json({ message: 'Connection accepted' });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user connections
router.get('/my-connections', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('connections', 'firstName lastName profilePicture headline')
      .populate('following', 'firstName lastName profilePicture headline')
      .populate('followers', 'firstName lastName profilePicture headline');

    res.json({
      connections: user.connections,
      following: user.following,
      followers: user.followers
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
