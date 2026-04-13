const Exam = require('../models/Exam');
const Grade = require('../models/Grade');

exports.getExams = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, classId, type, status, search } = req.query;
    const query = {};
    if (classId) query.class = classId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Exam.countDocuments(query);
    const exams = await Exam.find(query)
      .populate('class', 'name code subject')
      .populate('createdBy', 'name')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ date: -1 });

    res.json({ success: true, data: exams, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('class', 'name code subject students')
      .populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const grades = await Grade.find({ exam: exam._id }).populate('student', 'name studentId');
    res.json({ success: true, data: exam, grades });
  } catch (err) { next(err); }
};

exports.createExam = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err) { next(err); }
};

exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (err) { next(err); }
};

exports.deleteExam = async (req, res, next) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) { next(err); }
};
