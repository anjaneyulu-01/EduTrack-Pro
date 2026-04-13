const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentDashController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/profile', ctrl.getMyProfile);
router.put('/profile', ctrl.updateMyProfile);
router.get('/classes', ctrl.getMyClasses);
router.get('/exams', ctrl.getMyExams);
router.get('/grades', ctrl.getMyGrades);
router.get('/submissions', ctrl.getMySubmissions);
router.post('/submissions', ctrl.createMySubmission);
router.get('/attendance', ctrl.getMyAttendance);

module.exports = router;
