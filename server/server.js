require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http'); 
const { Server } = require('socket.io'); 

// Import Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const assignmentRoutes = require('./routes/assignments');
const uploadRoutes = require('./routes/upload');

// Import Models
const Message = require('./models/Message'); // We will create this next

const app = express();
const server = http.createServer(app); 

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

// Chat History Endpoint
app.get('/api/courses/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ course: req.params.id })
      .populate('sender', 'name')
      .sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Real-time Chat Logic
io.on('connection', (socket) => {
  socket.on('join_room', (courseId) => {
    socket.join(courseId);
  });

  socket.on('send_message', async (data) => {
    try {
      const newMessage = new Message({
        course: data.courseId,
        sender: data.senderId,
        content: data.content
      });
      await newMessage.save();

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
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
