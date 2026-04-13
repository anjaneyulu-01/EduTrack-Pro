const express = require('express');
const router = express.Router();
const { getSubmissions, createSubmission, updateSubmission, deleteSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSubmissions).post(createSubmission);
router.route('/:id').put(updateSubmission).delete(deleteSubmission);

module.exports = router;
