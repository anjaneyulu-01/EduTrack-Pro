const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');

exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status, classId } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];
    if (status) query.status = status;
    if (classId) query.classes = classId;

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('classes', 'name code subject')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('classes', 'name code subject teacher');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) { next(err); }
};

exports.getStudentStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const grades = await Grade.find({ student: id }).populate('exam', 'title type totalMarks').populate('class', 'name code');
    const attendance = await Attendance.find({ student: id });
    const submissions = await Submission.find({ student: id });

    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? ((totalPresent / attendance.length) * 100).toFixed(1) : 0;

    const avgGrade = grades.length > 0
      ? (grades.reduce((s, g) => s + g.percentage, 0) / grades.length).toFixed(1) : 0;

    res.json({ success: true, data: { grades, attendance, submissions, attendanceRate, avgGrade } });
  } catch (err) { next(err); }
};
