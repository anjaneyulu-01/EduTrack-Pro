const Class = require('../models/Class');
const Student = require('../models/Student');

exports.getClasses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status, semester, year } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
    if (status) query.status = status;
    if (semester) query.semester = semester;
    if (year) query.year = Number(year);

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('teacher', 'name email avatar')
      .populate('students', 'name studentId')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, data: classes, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacher', 'name email avatar phone')
      .populate('students', 'name studentId email status gpa profileImage');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) { next(err); }
};

exports.createClass = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (err) { next(err); }
};

exports.updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (err) { next(err); }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) { next(err); }
};

exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    if (cls.students.includes(studentId)) {
      return res.status(400).json({ success: false, message: 'Student already enrolled' });
    }
    if (cls.students.length >= cls.capacity) {
      return res.status(400).json({ success: false, message: 'Class is full' });
    }
    cls.students.push(studentId);
    await cls.save();
    await Student.findByIdAndUpdate(studentId, { $addToSet: { classes: cls._id } });
    res.json({ success: true, data: cls, message: 'Student enrolled' });
  } catch (err) { next(err); }
};

exports.unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const cls = await Class.findByIdAndUpdate(req.params.id, { $pull: { students: studentId } }, { new: true });
    await Student.findByIdAndUpdate(studentId, { $pull: { classes: req.params.id } });
    res.json({ success: true, data: cls, message: 'Student unenrolled' });
  } catch (err) { next(err); }
};
