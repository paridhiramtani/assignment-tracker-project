const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

exports.getAssignments = async (req, res) => {
  try {
    const userCourses = await Course.find({ $or: [{ owner: req.userId }, { members: req.userId }] }).select('_id');
    const courseIds = userCourses.map(c => c._id);
    
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title code')
      .sort('dueDate');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { course, title, dueDate } = req.body;
    const courseDoc = await Course.findById(course);
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' });
    
    if (courseDoc.owner.toString() !== req.userId.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course');
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });

    const { fileUrl, comment } = req.body;
    const submission = { user: req.userId, fileUrl, comment, submittedAt: new Date() };

    const existingIndex = assignment.submissions.findIndex(s => s.user.toString() === req.userId.toString());
    if (existingIndex > -1) assignment.submissions[existingIndex] = submission;
    else assignment.submissions.push(submission);

    assignment.status = 'Submitted';
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting' });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, { status: 'Graded' }, { new: true });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error grading' });
  }
};
