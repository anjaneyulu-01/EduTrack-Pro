const Submission = require('../models/Submission');
const Exam = require('../models/Exam');

exports.getSubmissions = async (req, res, next) => {
  try {
    const { studentId, examId, classId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (examId) query.exam = examId;
    if (classId) query.class = classId;
    if (status) query.status = status;

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('student', 'name studentId profileImage')
      .populate('exam', 'title type date totalMarks')
      .populate('class', 'name code')
      .populate('grade')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions, total });
  } catch (err) { next(err); }
};

exports.createSubmission = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.body.exam);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const isLate = exam.date && new Date() > new Date(exam.date);
    req.body.isLate = isLate;
    if (isLate) req.body.status = 'late';

    const existing = await Submission.findOne({ student: req.body.student, exam: req.body.exam });
    if (existing) {
      existing.content = req.body.content || existing.content;
      existing.status = 'resubmitted';
      await existing.save();
      return res.json({ success: true, data: existing });
    }
    const submission = await Submission.create(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (err) { next(err); }
};

exports.updateSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.json({ success: true, data: submission });
  } catch (err) { next(err); }
};

exports.deleteSubmission = async (req, res, next) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted' });
  } catch (err) { next(err); }
};
