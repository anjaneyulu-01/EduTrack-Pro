const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  guardianName: { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  guardianEmail: { type: String, default: '' },
  enrollmentDate: { type: Date, default: Date.now },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  profileImage: { type: String, default: '' },
  gpa: { type: Number, default: 0, min: 0, max: 4 },
  notes: { type: String, default: '' },
}, { timestamps: true });

StudentSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const count = await mongoose.model('Student').countDocuments();
    this.studentId = `STU${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Student', StudentSchema);
