const express = require('express');
const router = express.Router();
const { getGrades, createGrade, updateGrade, deleteGrade, getClassGradeSummary } = require('../controllers/gradeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getGrades).post(createGrade);
router.route('/:id').put(updateGrade).delete(deleteGrade);
router.get('/summary/:classId', getClassGradeSummary);

module.exports = router;
