const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Exam title is required'], trim: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  type: { type: String, enum: ['quiz', 'midterm', 'final', 'assignment', 'project', 'lab'], required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60, comment: 'in minutes' },
  totalMarks: { type: Number, required: true, default: 100 },
  passingMarks: { type: Number, default: 40 },
  instructions: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  allowLateSubmission: { type: Boolean, default: false },
  lateSubmissionDeadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
