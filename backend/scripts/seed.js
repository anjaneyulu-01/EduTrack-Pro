require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://a9:123@cluster0.rpejexn.mongodb.net/student-management?appName=Cluster0';

const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Exam = require('../models/Exam');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Submission = require('../models/Submission');

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Student.deleteMany(), Class.deleteMany(), Exam.deleteMany(), Grade.deleteMany(), Attendance.deleteMany(), Submission.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({ name: 'Admin User', email: 'admin@school.com', password: 'admin123', role: 'admin', phone: '+1-555-0100' });
  const teacher1 = await User.create({ name: 'Dr. Sarah Johnson', email: 'sarah@school.com', password: 'teacher123', role: 'teacher', phone: '+1-555-0101' });
  const teacher2 = await User.create({ name: 'Prof. Michael Chen', email: 'michael@school.com', password: 'teacher123', role: 'teacher', phone: '+1-555-0102' });
  // Student user accounts for portal access
  const studentUser1 = await User.create({ name: 'Alice Johnson', email: 'alice@student.com', password: 'student123', role: 'student', phone: '+1-555-1001' });
  const studentUser2 = await User.create({ name: 'Bob Smith', email: 'bob@student.com', password: 'student123', role: 'student', phone: '+1-555-1002' });
  console.log('Created users');

  // Create students — first two linked to user accounts for portal login
  const studentsData = [
    { user: studentUser1._id, name: 'Alice Johnson', email: 'alice@student.com', phone: '+1-555-1001', gender: 'female', status: 'active', address: { city: 'New York', country: 'USA' }, guardianName: 'Robert Johnson', dateOfBirth: new Date('2002-03-15') },
    { user: studentUser2._id, name: 'Bob Smith', email: 'bob@student.com', phone: '+1-555-1002', gender: 'male', status: 'active', address: { city: 'Los Angeles', country: 'USA' }, guardianName: 'Mary Smith', dateOfBirth: new Date('2001-07-22') },
    { name: 'Carol White', email: 'carol@student.com', phone: '+1-555-1003', gender: 'female', status: 'active', address: { city: 'Chicago', country: 'USA' }, dateOfBirth: new Date('2002-11-08') },
    { name: 'David Brown', email: 'david@student.com', phone: '+1-555-1004', gender: 'male', status: 'active', address: { city: 'Houston', country: 'USA' }, dateOfBirth: new Date('2001-05-30') },
    { name: 'Emma Davis', email: 'emma@student.com', phone: '+1-555-1005', gender: 'female', status: 'active', address: { city: 'Phoenix', country: 'USA' }, dateOfBirth: new Date('2002-09-14') },
    { name: 'Frank Miller', email: 'frank@student.com', phone: '+1-555-1006', gender: 'male', status: 'inactive', address: { city: 'Philadelphia', country: 'USA' }, dateOfBirth: new Date('2001-01-25') },
    { name: 'Grace Wilson', email: 'grace@student.com', phone: '+1-555-1007', gender: 'female', status: 'active', address: { city: 'San Antonio', country: 'USA' }, dateOfBirth: new Date('2002-06-18') },
    { name: 'Henry Taylor', email: 'henry@student.com', phone: '+1-555-1008', gender: 'male', status: 'graduated', address: { city: 'San Diego', country: 'USA' }, dateOfBirth: new Date('2000-12-05') },
  ];
  const students = [];
  for (const s of studentsData) { students.push(await Student.create(s)); }
  console.log(`Created ${students.length} students`);

  // Create classes
  const class1 = await Class.create({
    name: 'Advanced Mathematics', code: 'MATH401', subject: 'Mathematics',
    teacher: teacher1._id, students: students.slice(0, 5).map(s => s._id),
    semester: 'Fall', year: 2024, capacity: 30, status: 'active', coverColor: '#6366f1',
    schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Room 101' }, { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Room 101' }]
  });
  const class2 = await Class.create({
    name: 'Computer Science Fundamentals', code: 'CS101', subject: 'Computer Science',
    teacher: teacher2._id, students: students.slice(2, 7).map(s => s._id),
    semester: 'Fall', year: 2024, capacity: 25, status: 'active', coverColor: '#10b981',
    schedule: [{ day: 'Tuesday', startTime: '11:00', endTime: '12:30', room: 'Lab 201' }, { day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'Lab 201' }]
  });
  const class3 = await Class.create({
    name: 'Physics 201', code: 'PHY201', subject: 'Physics',
    teacher: teacher1._id, students: students.slice(0, 4).map(s => s._id),
    semester: 'Spring', year: 2024, capacity: 20, status: 'completed', coverColor: '#f59e0b',
  });
  console.log('Created classes');

  // Update student classes
  for (const s of students.slice(0, 5)) await Student.findByIdAndUpdate(s._id, { $addToSet: { classes: class1._id } });
  for (const s of students.slice(2, 7)) await Student.findByIdAndUpdate(s._id, { $addToSet: { classes: class2._id } });

  // Create exams
  const exam1 = await Exam.create({ title: 'Calculus Midterm', class: class1._id, type: 'midterm', date: new Date('2024-10-15'), totalMarks: 100, passingMarks: 40, duration: 90, status: 'completed', createdBy: teacher1._id });
  const exam2 = await Exam.create({ title: 'Algebra Quiz 1', class: class1._id, type: 'quiz', date: new Date('2024-10-01'), totalMarks: 30, passingMarks: 12, duration: 30, status: 'completed', createdBy: teacher1._id });
  const exam3 = await Exam.create({ title: 'Programming Assignment 1', class: class2._id, type: 'assignment', date: new Date('2024-10-20'), totalMarks: 50, passingMarks: 20, duration: 0, status: 'completed', createdBy: teacher2._id });
  const exam4 = await Exam.create({ title: 'Final Exam', class: class1._id, type: 'final', date: new Date('2024-12-20'), totalMarks: 150, passingMarks: 60, duration: 180, status: 'upcoming', createdBy: teacher1._id });
  const exam5 = await Exam.create({ title: 'Data Structures Project', class: class2._id, type: 'project', date: new Date('2024-11-15'), totalMarks: 100, passingMarks: 40, duration: 0, status: 'upcoming', createdBy: teacher2._id });
  console.log('Created exams');

  // Create grades
  const gradeData = [
    { student: students[0]._id, exam: exam1._id, class: class1._id, marksObtained: 88, totalMarks: 100, feedback: 'Excellent work on derivatives!' },
    { student: students[1]._id, exam: exam1._id, class: class1._id, marksObtained: 72, totalMarks: 100, feedback: 'Good effort, review integration.' },
    { student: students[2]._id, exam: exam1._id, class: class1._id, marksObtained: 95, totalMarks: 100, feedback: 'Outstanding performance!' },
    { student: students[3]._id, exam: exam1._id, class: class1._id, marksObtained: 61, totalMarks: 100, feedback: 'Needs improvement on limits.' },
    { student: students[4]._id, exam: exam1._id, class: class1._id, marksObtained: 78, totalMarks: 100 },
    { student: students[0]._id, exam: exam2._id, class: class1._id, marksObtained: 27, totalMarks: 30 },
    { student: students[1]._id, exam: exam2._id, class: class1._id, marksObtained: 22, totalMarks: 30 },
    { student: students[2]._id, exam: exam3._id, class: class2._id, marksObtained: 45, totalMarks: 50, feedback: 'Great code quality!' },
    { student: students[3]._id, exam: exam3._id, class: class2._id, marksObtained: 38, totalMarks: 50 },
    { student: students[4]._id, exam: exam3._id, class: class2._id, marksObtained: 42, totalMarks: 50 },
  ];
  for (const g of gradeData) {
    g.gradedBy = teacher1._id;
    await Grade.create(g);
  }
  console.log('Created grades');

  // Create attendance records
  const classDays = [new Date('2024-10-01'), new Date('2024-10-03'), new Date('2024-10-07'), new Date('2024-10-09'), new Date('2024-10-14')];
  const statuses = ['present', 'present', 'present', 'absent', 'present'];
  for (let i = 0; i < 5; i++) {
    for (const student of students.slice(0, 5)) {
      const rand = Math.random();
      await Attendance.create({
        student: student._id, class: class1._id, date: classDays[i],
        status: rand > 0.85 ? 'absent' : rand > 0.75 ? 'late' : 'present',
        markedBy: teacher1._id,
      });
    }
  }
  console.log('Created attendance records');

  // Create submissions
  for (const student of students.slice(0, 5)) {
    await Submission.create({ student: student._id, exam: exam1._id, class: class1._id, status: 'graded', submittedAt: new Date('2024-10-15') });
    await Submission.create({ student: student._id, exam: exam2._id, class: class1._id, status: 'graded', submittedAt: new Date('2024-10-01') });
  }
  for (const student of students.slice(2, 6)) {
    await Submission.create({ student: student._id, exam: exam3._id, class: class2._id, status: 'graded', submittedAt: new Date('2024-10-19') });
  }
  console.log('Created submissions');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('  Admin:   admin@school.com   / admin123');
  console.log('  Teacher: sarah@school.com   / teacher123');
  console.log('  Student: alice@student.com  / student123');
  console.log('  Student: bob@student.com    / student123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
