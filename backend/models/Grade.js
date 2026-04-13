const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  totalMarks: { type: Number, required: true },
  percentage: { type: Number },
  letterGrade: { type: String, enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'], },
  gradePoints: { type: Number },
  feedback: { type: String, default: '' },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date, default: Date.now },
}, { timestamps: true });

GradeSchema.pre('save', function (next) {
  this.percentage = parseFloat(((this.marksObtained / this.totalMarks) * 100).toFixed(2));
  const p = this.percentage;
  if (p >= 97) { this.letterGrade = 'A+'; this.gradePoints = 4.0; }
  else if (p >= 93) { this.letterGrade = 'A'; this.gradePoints = 4.0; }
  else if (p >= 90) { this.letterGrade = 'A-'; this.gradePoints = 3.7; }
  else if (p >= 87) { this.letterGrade = 'B+'; this.gradePoints = 3.3; }
  else if (p >= 83) { this.letterGrade = 'B'; this.gradePoints = 3.0; }
  else if (p >= 80) { this.letterGrade = 'B-'; this.gradePoints = 2.7; }
  else if (p >= 77) { this.letterGrade = 'C+'; this.gradePoints = 2.3; }
  else if (p >= 73) { this.letterGrade = 'C'; this.gradePoints = 2.0; }
  else if (p >= 70) { this.letterGrade = 'C-'; this.gradePoints = 1.7; }
  else if (p >= 60) { this.letterGrade = 'D'; this.gradePoints = 1.0; }
  else { this.letterGrade = 'F'; this.gradePoints = 0.0; }
  next();
});

module.exports = mongoose.model('Grade', GradeSchema);
