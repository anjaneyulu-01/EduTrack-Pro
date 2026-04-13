const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');
const Class = require('../models/Class');

// Helper: find Student doc by logged-in user
const getStudentRecord = async (userId) => {
  const student = await Student.findOne({ user: userId }).populate('classes', 'name code subject teacher coverColor schedule');
  return student;
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('classes', 'name code subject teacher coverColor semester year status');
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found. Please contact your admin.' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const allowed = ['phone', 'dateOfBirth', 'gender', 'address', 'guardianName', 'guardianPhone', 'guardianEmail', 'notes'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const student = await Student.findOneAndUpdate({ user: req.user._id }, updates, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    res.json({ success: true, data: student });
  } catch (err) { next(err); }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const student = await getStudentRecord(req.user._id);
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const classIds = student.classes.map(c => c._id);

    const [grades, attendance, submissions, upcomingExams] = await Promise.all([
      Grade.find({ student: student._id })
        .populate('exam', 'title type date totalMarks')
        .populate('class', 'name code')
        .sort({ createdAt: -1 })
        .limit(20),
      Attendance.find({ student: student._id })
        .populate('class', 'name code')
        .sort({ date: -1 })
        .limit(30),
      Submission.find({ student: student._id })
        .populate('exam', 'title type date totalMarks')
        .populate('class', 'name code')
        .sort({ submittedAt: -1 })
        .limit(10),
      Exam.find({
        class: { $in: classIds },
        date: { $gte: new Date() },
        status: { $in: ['upcoming', 'ongoing'] }
      }).populate('class', 'name code coverColor').sort({ date: 1 }).limit(5),
    ]);

    const avgGrade = grades.length
      ? (grades.reduce((s, g) => s + g.percentage, 0) / grades.length).toFixed(1) : 0;
    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length
      ? ((totalPresent / attendance.length) * 100).toFixed(1) : 0;

    // Grade trend (last 8 grades)
    const gradeTrend = grades.slice(0, 8).reverse().map((g, i) => ({
      label: g.exam?.title?.slice(0, 10) || `Exam ${i + 1}`,
      score: g.percentage,
      grade: g.letterGrade,
    }));

    // Attendance breakdown
    const attendanceSummary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      total: attendance.length,
      rate: attendanceRate,
    };

    res.json({
      success: true, data: {
        student,
        stats: {
          totalClasses: classIds.length,
          upcomingExams: upcomingExams.length,
          avgGrade: parseFloat(avgGrade),
          attendanceRate: parseFloat(attendanceRate),
          totalSubmissions: submissions.length,
          pendingSubmissions: submissions.filter(s => s.status === 'submitted' || s.status === 'resubmitted').length,
        },
        upcomingExams,
        recentGrades: grades.slice(0, 5),
        recentSubmissions: submissions.slice(0, 5),
        gradeTrend,
        attendanceSummary,
      }
    });
  } catch (err) { next(err); }
};

exports.getMyClasses = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });
    const classes = await Class.find({ _id: { $in: student.classes } })
      .populate('teacher', 'name email avatar phone')
      .populate('students', 'name studentId profileImage');
    res.json({ success: true, data: classes });
  } catch (err) { next(err); }
};

exports.getMyExams = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });

    const exams = await Exam.find({ class: { $in: student.classes } })
      .populate('class', 'name code coverColor')
      .sort({ date: -1 });

    // Attach student's grade to each exam
    const grades = await Grade.find({ student: student._id });
    const gradeMap = {};
    grades.forEach(g => { gradeMap[g.exam.toString()] = g; });

    const examsWithGrades = exams.map(e => ({
      ...e.toObject(),
      myGrade: gradeMap[e._id.toString()] || null,
    }));

    res.json({ success: true, data: examsWithGrades });
  } catch (err) { next(err); }
};

exports.getMyGrades = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });

    const grades = await Grade.find({ student: student._id })
      .populate('exam', 'title type date totalMarks')
      .populate('class', 'name code coverColor')
      .populate('gradedBy', 'name')
      .sort({ createdAt: -1 });

    // Per-class GPA
    const classMap = {};
    grades.forEach(g => {
      const cls = g.class?._id?.toString();
      if (!cls) return;
      if (!classMap[cls]) classMap[cls] = { name: g.class?.name, grades: [] };
      classMap[cls].grades.push(g);
    });
    const classGPA = Object.values(classMap).map(c => ({
      name: c.name,
      avgScore: (c.grades.reduce((s, g) => s + g.percentage, 0) / c.grades.length).toFixed(1),
      count: c.grades.length,
    }));

    res.json({ success: true, data: grades, classGPA });
  } catch (err) { next(err); }
};

exports.getMySubmissions = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });

    const submissions = await Submission.find({ student: student._id })
      .populate('exam', 'title type date totalMarks allowLateSubmission lateSubmissionDeadline')
      .populate('class', 'name code coverColor')
      .populate('grade')
      .sort({ submittedAt: -1 });

    // Exams without submission
    const submittedExamIds = submissions.map(s => s.exam?._id?.toString());
    const pendingExams = await Exam.find({
      class: { $in: student.classes },
      _id: { $nin: submittedExamIds },
      status: { $in: ['upcoming', 'ongoing'] }
    }).populate('class', 'name code');

    res.json({ success: true, data: submissions, pendingExams });
  } catch (err) { next(err); }
};

exports.createMySubmission = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });

    const exam = await Exam.findById(req.body.exam);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Check student is enrolled in the class
    if (!student.classes.some(c => c.toString() === exam.class.toString())) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this class' });
    }

    const isLate = new Date() > new Date(exam.date);
    const existing = await Submission.findOne({ student: student._id, exam: exam._id });
    if (existing) {
      existing.content = req.body.content || existing.content;
      existing.status = 'resubmitted';
      existing.submittedAt = new Date();
      await existing.save();
      return res.json({ success: true, data: existing, message: 'Resubmitted' });
    }

    const submission = await Submission.create({
      student: student._id,
      exam: exam._id,
      class: exam.class,
      content: req.body.content || '',
      status: isLate ? 'late' : 'submitted',
      isLate,
    });

    res.status(201).json({ success: true, data: submission });
  } catch (err) { next(err); }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Profile not found' });

    const { classId, startDate, endDate } = req.query;
    const query = { student: student._id };
    if (classId) query.class = classId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('class', 'name code coverColor')
      .sort({ date: -1 });

    // Per-class breakdown
    const classBreakdown = {};
    records.forEach(r => {
      const cls = r.class?._id?.toString();
      if (!cls) return;
      if (!classBreakdown[cls]) classBreakdown[cls] = { name: r.class?.name, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      classBreakdown[cls][r.status]++;
      classBreakdown[cls].total++;
    });

    const breakdown = Object.values(classBreakdown).map(c => ({
      ...c,
      rate: c.total ? ((c.present / c.total) * 100).toFixed(1) : 0,
    }));

    res.json({ success: true, data: records, breakdown });
  } catch (err) { next(err); }
};
