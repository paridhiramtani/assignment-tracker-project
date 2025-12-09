require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http'); // New
const { Server } = require('socket.io'); // New
const Message = require('./models/Message'); // New

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app); // Wrap express

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/upload', uploadRoutes);

// Endpoint to get chat history
app.get('/api/courses/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ course: req.params.id })
      .populate('sender', 'name')
      .sort('createdAt'); // Oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Socket Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (courseId) => {
    socket.join(courseId);
    console.log(`User joined room: ${courseId}`);
  });

  socket.on('send_message', async (data) => {
    // data = { courseId, senderId, content, senderName }
    
    // Save to DB
    try {
      const newMessage = new Message({
        course: data.courseId,
        sender: data.senderId,
        content: data.content
      });
      await newMessage.save();

      // Broadcast to room
      io.to(data.courseId).emit('receive_message', {
        _id: newMessage._id,
        content: data.content,
        sender: { _id: data.senderId, name: data.senderName },
        createdAt: newMessage.createdAt
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
// Note: We listen on 'server', not 'app'
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
