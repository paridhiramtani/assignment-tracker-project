// server/controllers/courseController.js
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

exports.getCourses = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find courses where user is owner or member
    const courses = await Course.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort('-createdAt');

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, code, description } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: 'Title and code are required' });
    }

    // Check for duplicate code
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      title,
      code: code.toUpperCase(),
      description,
      owner: req.userId,
      members: [req.userId]
    });

    await course.save();
    await course.populate('owner', 'name email');

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access
    const hasAccess = course.members.some(
      member => member._id.toString() === req.userId.toString()
    ) || course.owner._id.toString() === req.userId.toString();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get assignments for this course
    const assignments = await Assignment.find({ course: course._id })
      .sort('dueDate');

    res.json({ course, assignments });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is owner or instructor
    if (course.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description } = req.body;
    
    if (title) course.title = title;
    if (description !== undefined) course.description = description;

    await course.save();
    await course.populate('owner', 'name email');

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is owner or instructor
    if (course.owner.toString() !== req.userId.toString() && 
        req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all assignments associated with this course
    await Assignment.deleteMany({ course: course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (course.members.includes(req.userId)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.members.push(req.userId);
    await course.save();
    await course.populate('owner', 'name email');
    await course.populate('members', 'name email');

    res.json(course);
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Error enrolling in course' });
  }
};

exports.leaveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Can't leave if you're the owner
    if (course.owner.toString() === req.userId.toString()) {
      return res.status(400).json({ 
        message: 'Course owner cannot leave. Delete the course instead.' 
      });
    }

    course.members = course.members.filter(
      member => member.toString() !== req.userId.toString()
    );
    
    await course.save();

    res.json({ message: 'Successfully left the course' });
  } catch (error) {
    console.error('Leave course error:', error);
    res.status(500).json({ message: 'Error leaving course' });
  }
};

// server/routes/courses.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', courseController.getCourses);
router.post('/', courseController.createCourse);
router.get('/:id', courseController.getCourseById);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.post('/:id/enroll', courseController.enrollCourse);
router.post('/:id/leave', courseController.leaveCourse);

module.exports = router;
