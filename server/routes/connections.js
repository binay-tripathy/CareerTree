const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send connection request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already connected' });
    }

    // Check if request already sent
    const existingSentRequest = currentUser.connectionRequests.sent.find(
      req => req.user.toString() === targetUserId
    );
    if (existingSentRequest) {
      return res.status(400).json({ message: 'Connection request already sent' });
    }

    // Check if request already received (they sent us a request)
    const existingReceivedRequest = currentUser.connectionRequests.received.find(
      req => req.user.toString() === targetUserId
    );
    if (existingReceivedRequest) {
      return res.status(400).json({ message: 'This user has already sent you a connection request' });
    }

    // Add to current user's sent requests
    await User.findByIdAndUpdate(currentUserId, {
      $push: {
        'connectionRequests.sent': {
          user: targetUserId,
          sentAt: new Date()
        }
      }
    });

    // Add to target user's received requests
    await User.findByIdAndUpdate(targetUserId, {
      $push: {
        'connectionRequests.received': {
          user: currentUserId,
          sentAt: new Date()
        }
      }
    });

    res.json({ message: 'Connection request sent successfully' });
  } catch (error) {
    console.error('Connection request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept connection request
router.post('/accept/:userId', auth, async (req, res) => {
  try {
    const requesterId = req.params.userId;
    const currentUserId = req.user._id;

    // Check if there's a pending request
    const currentUser = await User.findById(currentUserId);
    const requestExists = currentUser.connectionRequests.received.find(
      req => req.user.toString() === requesterId
    );

    if (!requestExists) {
      return res.status(400).json({ message: 'No connection request found' });
    }

    // Add to both users' connections
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { connections: requesterId },
      $pull: { 'connectionRequests.received': { user: requesterId } }
    });

    await User.findByIdAndUpdate(requesterId, {
      $addToSet: { connections: currentUserId },
      $pull: { 'connectionRequests.sent': { user: currentUserId } }
    });

    res.json({ message: 'Connection request accepted' });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject connection request
router.post('/reject/:userId', auth, async (req, res) => {
  try {
    const requesterId = req.params.userId;
    const currentUserId = req.user._id;

    // Remove from both users' request lists
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { 'connectionRequests.received': { user: requesterId } }
    });

    await User.findByIdAndUpdate(requesterId, {
      $pull: { 'connectionRequests.sent': { user: currentUserId } }
    });

    res.json({ message: 'Connection request rejected' });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel connection request
router.delete('/cancel/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Remove from both users' request lists
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { 'connectionRequests.sent': { user: targetUserId } }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { 'connectionRequests.received': { user: currentUserId } }
    });

    res.json({ message: 'Connection request cancelled' });
  } catch (error) {
    console.error('Cancel connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user connections and requests
router.get('/my-connections', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'firstName lastName profilePicture headline')
      .populate('connectionRequests.sent.user', 'firstName lastName profilePicture headline')
      .populate('connectionRequests.received.user', 'firstName lastName profilePicture headline');

    res.json({
      connections: user.connections || [],
      sentRequests: user.connectionRequests?.sent || [],
      receivedRequests: user.connectionRequests?.received || []
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove connection
router.delete('/remove/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Remove from both users' connections
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { connections: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { connections: currentUserId }
    });

    res.json({ message: 'Connection removed' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
