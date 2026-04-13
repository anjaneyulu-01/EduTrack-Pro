const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass, enrollStudent, unenrollStudent } = require('../controllers/classController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getClasses).post(createClass);
router.route('/:id').get(getClass).put(updateClass).delete(deleteClass);
router.post('/:id/enroll', enrollStudent);
router.delete('/:id/unenroll/:studentId', unenrollStudent);

module.exports = router;
