// server/controllers/assignmentController.js
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

exports.getAssignments = async (req, res) => {
  try {
    const { course, status, dueDate } = req.query;
    const userId = req.userId;

    // Find courses user has access to
    const userCourses = await Course.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    }).select('_id');

    const courseIds = userCourses.map(c => c._id);

    // Build query
    const query = { course: { $in: courseIds } };
    
    if (course) query.course = course;
    if (status) query.status = status;
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .populate('submissions.user', 'name email')
      .sort('dueDate');

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { course, title, description, dueDate, priority } = req.body;

    if (!course || !title || !dueDate) {
      return res.status(400).json({ 
        message: 'Course, title, and due date are required' 
      });
    }

    // Verify course exists and user has permission
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ 
        message: 'Only course owner or instructor can create assignments' 
      });
    }

    const assignment = new Assignment({
      course,
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'Normal'
    });

    await assignment.save();
    await assignment.populate('course', 'title code');

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code owner members')
      .populate('submissions.user', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check access
    const hasAccess = assignment.course.members.some(
      member => member.toString() === req.userId.toString()
    ) || assignment.course.owner.toString() === req.userId.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'owner');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permission
    if (assignment.course.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, dueDate, priority, status } = req.body;
    
    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (priority) assignment.priority = priority;
    if (status) assignment.status = status;

    await assignment.save();
    await assignment.populate('course', 'title code');

    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'owner');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permission
    if (assignment.course.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const { fileUrl, comment } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    // Check if user already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.user.toString() === req.userId.toString()
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.comment = comment;
      existingSubmission.submittedAt = new Date();
    } else {
      // Add new submission
      assignment.submissions.push({
        user: req.userId,
        fileUrl,
        comment,
        submittedAt: new Date()
      });
    }

    assignment.status = 'Submitted';
    await assignment.save();
    await assignment.populate('submissions.user', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Error submitting assignment' });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'owner');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permission
    if (assignment.course.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    assignment.status = 'Graded';
    await assignment.save();

    res.json(assignment);
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Error grading assignment' });
  }
};

// server/routes/assignments.js
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', assignmentController.getAssignments);
router.post('/', assignmentController.createAssignment);
router.get('/:id', assignmentController.getAssignmentById);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);
router.post('/:id/submit', assignmentController.submitAssignment);
router.put('/:id/grade', assignmentController.gradeAssignment);

module.exports = router;
