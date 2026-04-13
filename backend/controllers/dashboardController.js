const Student = require('../models/Student');
const Class = require('../models/Class');
const Exam = require('../models/Exam');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalClasses, totalExams, totalSubmissions] = await Promise.all([
      Student.countDocuments(),
      Class.countDocuments({ status: 'active' }),
      Exam.countDocuments(),
      Submission.countDocuments(),
    ]);

    const activeStudents = await Student.countDocuments({ status: 'active' });
    const upcomingExams = await Exam.find({ status: 'upcoming', date: { $gte: new Date() } })
      .populate('class', 'name code').sort({ date: 1 }).limit(5);

    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('name email studentId status profileImage');
    const recentGrades = await Grade.find().sort({ createdAt: -1 }).limit(5)
      .populate('student', 'name studentId').populate('exam', 'title type');

    // Grade distribution
    const gradeDistribution = await Grade.aggregate([
      { $group: { _id: '$letterGrade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Monthly enrollment (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyEnrollment = await Student.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Attendance stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today }, status: 'present' });
    const avgGradeResult = await Grade.aggregate([{ $group: { _id: null, avg: { $avg: '$percentage' } } }]);
    const avgGrade = avgGradeResult.length ? avgGradeResult[0].avg.toFixed(1) : 0;

    res.json({
      success: true, data: {
        stats: { totalStudents, activeStudents, totalClasses, totalExams, totalSubmissions, todayAttendance, avgGrade },
        upcomingExams, recentStudents, recentGrades, gradeDistribution, monthlyEnrollment,
      }
    });
  } catch (err) { next(err); }
};
