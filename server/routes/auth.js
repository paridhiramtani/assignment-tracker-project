const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Because we used 'module.exports = authMiddleware', we import it directly:
const authMiddleware = require('../middleware/authMiddleware'); 

// Debugging line: If deployment fails, this will show in logs what is being imported
console.log('AuthMiddleware Type:', typeof authMiddleware); 

router.post('/register', authController.register);
router.post('/login', authController.login);

// This is where it was crashing:
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
