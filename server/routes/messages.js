const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      content
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
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('receiver', 'firstName lastName profilePicture')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
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
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    await Message.populate(conversations, {
      path: 'lastMessage.sender lastMessage.receiver',
      select: 'firstName lastName profilePicture'
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
