const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Resource = require('../models/Resource');

exports.getCourses = async (req, res) => {
  try {
    const userId = req.userId;
    const courses = await Course.find({
      $or: [{ owner: userId }, { members: userId }]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, code, description } = req.body;
    if (!title || !code) return res.status(400).json({ message: 'Title and code required' });

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Code exists' });

    const course = new Course({
      title, code: code.toUpperCase(), description, owner: req.userId, members: [req.userId]
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('owner', 'name').populate('members', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    // Check access
    const isMember = course.members.some(m => m._id.toString() === req.userId.toString());
    const isOwner = course.owner._id.toString() === req.userId.toString();
    if (!isMember && !isOwner) return res.status(403).json({ message: 'Access denied' });

    const assignments = await Assignment.find({ course: course._id }).sort('dueDate');
    res.json({ course, assignments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.owner.toString() !== req.userId.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.owner.toString() !== req.userId.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Assignment.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course' });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.members.includes(req.userId)) return res.status(400).json({ message: 'Already enrolled' });
    
    course.members.push(req.userId);
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling' });
  }
};

exports.leaveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.owner.toString() === req.userId.toString()) return res.status(400).json({ message: 'Owner cannot leave' });

    course.members = course.members.filter(m => m.toString() !== req.userId.toString());
    await course.save();
    res.json({ message: 'Left course' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving' });
  }
};

exports.addResource = async (req, res) => {
  try {
    const { title, fileUrl, type } = req.body;
    const course = await Course.findById(req.params.id);
    
    // Check permissions
    if (course.owner.toString() !== req.userId && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resource = new Resource({
      course: req.params.id,
      title,
      fileUrl,
      type,
      uploadedBy: req.userId
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error adding resource' });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ course: req.params.id }).sort('-createdAt');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
};
