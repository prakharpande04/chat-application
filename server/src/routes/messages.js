const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;
    const receiver = await User.findById(req.params.userId);

    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiver._id,
      content,
      type
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    // Emit the message through Socket.IO
    req.app.get('io').to(receiver._id.toString()).emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:userId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          read: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(unreadCounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 