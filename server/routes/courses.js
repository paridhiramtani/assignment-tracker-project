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
router.post('/:id/resources', courseController.addResource);
router.get('/:id/resources', courseController.getResources);

module.exports = router;
