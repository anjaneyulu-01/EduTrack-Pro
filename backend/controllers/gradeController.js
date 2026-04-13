const Grade = require('../models/Grade');

exports.getGrades = async (req, res, next) => {
  try {
    const { studentId, classId, examId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (examId) query.exam = examId;

    const total = await Grade.countDocuments(query);
    const grades = await Grade.find(query)
      .populate('student', 'name studentId profileImage')
      .populate('exam', 'title type totalMarks date')
      .populate('class', 'name code')
      .populate('gradedBy', 'name')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: grades, total });
  } catch (err) { next(err); }
};

exports.createGrade = async (req, res, next) => {
  try {
    req.body.gradedBy = req.user.id;
    const exists = await Grade.findOne({ student: req.body.student, exam: req.body.exam });
    if (exists) {
      const updated = await Grade.findOneAndUpdate(
        { student: req.body.student, exam: req.body.exam },
        req.body, { new: true, runValidators: true }
      );
      return res.json({ success: true, data: updated });
    }
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (err) { next(err); }
};

exports.updateGrade = async (req, res, next) => {
  try {
    req.body.gradedBy = req.user.id;
    req.body.gradedAt = Date.now();
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!grade) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, data: grade });
  } catch (err) { next(err); }
};

exports.deleteGrade = async (req, res, next) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Grade deleted' });
  } catch (err) { next(err); }
};

exports.getClassGradeSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const grades = await Grade.find({ class: classId });
    const distribution = { 'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'C-': 0, 'D': 0, 'F': 0 };
    grades.forEach(g => { if (g.letterGrade) distribution[g.letterGrade]++; });
    const avg = grades.length ? (grades.reduce((s, g) => s + g.percentage, 0) / grades.length).toFixed(1) : 0;
    res.json({ success: true, data: { distribution, average: avg, total: grades.length } });
  } catch (err) { next(err); }
};
