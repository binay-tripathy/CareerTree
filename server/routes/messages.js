const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    
    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Check if users are connected
    const currentUser = await User.findById(req.user._id);
    const isConnected = currentUser.connections.includes(receiverId);
    
    if (!isConnected) {
      return res.status(403).json({ message: 'You can only message your connections' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
      attachments,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await message.save();
    await message.populate('sender', 'firstName lastName profilePicture');
    await message.populate('receiver', 'firstName lastName profilePicture');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Check if users are connected
    const currentUser = await User.findById(currentUserId);
    const isConnected = currentUser.connections.includes(otherUserId);
    
    if (!isConnected) {
      return res.status(403).json({ message: 'You can only view conversations with your connections' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('receiver', 'firstName lastName profilePicture')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    // Return empty array if no messages (this is fine - it means new conversation)
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for a user (only with connections)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's connections
    const user = await User.findById(userId).populate('connections', 'firstName lastName profilePicture');
    
    if (!user.connections || user.connections.length === 0) {
      return res.json([]);
    }

    const connectionIds = user.connections.map(conn => conn._id);

    // Get latest message for each connected user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId, receiver: { $in: connectionIds } },
            { sender: { $in: connectionIds }, receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender'
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: { 
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details
    await User.populate(conversations, [
      { path: 'lastMessage.sender', select: 'firstName lastName profilePicture' },
      { path: 'lastMessage.receiver', select: 'firstName lastName profilePicture' },
      { path: '_id', select: 'firstName lastName profilePicture' }
    ]);

    // Transform data structure for frontend
    const formattedConversations = conversations.map(conv => ({
      _id: conv._id._id,
      participant: conv._id,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark conversation as read
router.put('/mark-read/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
