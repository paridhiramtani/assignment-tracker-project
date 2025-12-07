// server/routes/assignments.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Assignment CRUD routes
router.get('/', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

// Assignment submission routes
router.post('/:id/submit', assignmentController.submitAssignment);
router.put('/:id/grade', assignmentController.gradeAssignment);

module.exports = router;
