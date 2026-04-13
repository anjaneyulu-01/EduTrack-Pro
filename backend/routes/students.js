const express = require('express');
const router = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentStats } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getStudents).post(createStudent);
router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);
router.get('/:id/stats', getStudentStats);

module.exports = router;
