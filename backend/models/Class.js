const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Class name is required'], trim: true },
  code: { type: String, required: [true, 'Class code is required'], unique: true, uppercase: true },
  description: { type: String, default: '' },
  subject: { type: String, required: [true, 'Subject is required'] },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  schedule: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: String,
    endTime: String,
    room: String,
  }],
  semester: { type: String, enum: ['Fall','Spring','Summer','Winter'], required: true },
  year: { type: Number, required: true },
  capacity: { type: Number, default: 30 },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  coverColor: { type: String, default: '#6366f1' },
}, { timestamps: true });

ClassSchema.virtual('studentCount').get(function () {
  return this.students.length;
});

module.exports = mongoose.model('Class', ClassSchema);
