const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  submittedAt: { type: Date, default: Date.now },
  content: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded', 'late', 'missing', 'resubmitted'], default: 'submitted' },
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
  comments: { type: String, default: '' },
  isLate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
