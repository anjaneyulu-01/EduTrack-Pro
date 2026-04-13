const express = require('express');
const router = express.Router();
const { getAttendance, markAttendance, bulkMarkAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAttendance).post(markAttendance);
router.post('/bulk', bulkMarkAttendance);
router.get('/summary/:studentId/:classId', getAttendanceSummary);

module.exports = router;
