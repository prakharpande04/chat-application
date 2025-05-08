const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocketHandlers = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    
    // Join user's personal room
    socket.join(userId);

    // Update user status to online
    await User.findByIdAndUpdate(userId, {
      status: 'online',
      lastSeen: new Date()
    });

    // Broadcast user's online status
    socket.broadcast.emit('userStatus', {
      userId,
      status: 'online'
    });

    // Handle typing events
    socket.on('typing', ({ receiverId }) => {
      socket.to(receiverId).emit('typing', {
        userId,
        username: socket.user.username
      });
    });

    socket.on('stopTyping', ({ receiverId }) => {
      socket.to(receiverId).emit('stopTyping', {
        userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      socket.broadcast.emit('userStatus', {
        userId,
        status: 'offline'
      });
    });
  });
};

module.exports = { setupSocketHandlers }; 