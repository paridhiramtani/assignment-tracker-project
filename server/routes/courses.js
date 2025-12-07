// server/routes/courses.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Course CRUD routes
router.get('/', courseController.getCourses);
router.post('/', courseController.createCourse);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Course membership routes
router.post('/:id/enroll', courseController.enrollCourse);
router.post('/:id/leave', courseController.leaveCourse);

module.exports = router;
