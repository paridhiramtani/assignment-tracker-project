// server/config.js
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/course-tracker',
  jwtSecret: process.env.JWT_SECRET || 'default',
  jwtExpire: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // File upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg', 'zip'],
    uploadDir: './uploads'
  },
  
  // Security configuration
  bcryptRounds: 10,
  
  // CORS configuration
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
};
