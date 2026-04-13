const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res, next) => {
  try {
    const { studentId, classId, date, startDate, endDate, status } = req.query;
    const query = {};
    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (status) query.status = status;
    if (date) query.date = new Date(date);
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId profileImage')
      .populate('class', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, data: attendance, total: attendance.length });
  } catch (err) { next(err); }
};

exports.markAttendance = async (req, res, next) => {
  try {
    req.body.markedBy = req.user.id;
    const exists = await Attendance.findOne({ student: req.body.student, class: req.body.class, date: req.body.date });
    if (exists) {
      exists.status = req.body.status;
      exists.notes = req.body.notes || exists.notes;
      await exists.save();
      return res.json({ success: true, data: exists });
    }
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (err) { next(err); }
};

exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;
    const results = await Promise.all(records.map(async (r) => {
      r.markedBy = req.user.id;
      return Attendance.findOneAndUpdate(
        { student: r.student, class: r.class, date: r.date },
        r, { upsert: true, new: true }
      );
    }));
    res.json({ success: true, data: results, count: results.length });
  } catch (err) { next(err); }
};

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { studentId, classId } = req.params;
    const records = await Attendance.find({ student: studentId, class: classId });
    const summary = { present: 0, absent: 0, late: 0, excused: 0, total: records.length };
    records.forEach(r => summary[r.status]++);
    summary.percentage = records.length > 0 ? ((summary.present / records.length) * 100).toFixed(1) : 0;
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};
