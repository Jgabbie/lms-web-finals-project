const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');

    const hashed = await bcrypt.hash('admin123', 10);

    // Clean existing records to prevent duplicate key crashes
    await User.deleteMany({
      email: {
        $in: [
          'admin2@portal.com',
          'instructor@portal.com',
          'taysan@portal.com',
          'mm@portal.com',
          'flash@portal.com'
        ]
      }
    });
    await Assignment.deleteMany({});
    await Submission.deleteMany({});

    await User.create([
      {
        firstName: 'Admin',
        lastName: 'Portal',
        email: 'admin2@portal.com',
        password: hashed,
        role: 'admin'
      },
      {
        firstName: 'Instructor',
        lastName: 'Portal',
        email: 'instructor@portal.com',
        password: hashed,
        role: 'instructor'
      },
      {
        firstName: 'Tayshaun',
        lastName: 'Santos',
        email: 'taysan@portal.com',
        password: hashed,
        role: 'student'
      },
      {
        firstName: 'Mitsuha',
        lastName: 'Miyamizu',
        email: 'mm@portal.com',
        password: hashed,
        role: 'student'
      },
      {
        firstName: 'Barry',
        lastName: 'Allen',
        email: 'flash@portal.com',
        password: hashed,
        role: 'student'
      }
    ]);

    const studentUser = await User.findOne({ email: 'taysan@portal.com' });
    const instructorUser = await User.findOne({ email: 'instructor@portal.com' });

    const sampleAssignment = await Assignment.create({
      title: 'React Fundamentals Activity',
      course: 'Web Development',
      dueDate: '2026-10-15',
      points: 100,
      description: 'Build a modular component layout using props and state.',
      instructorId: instructorUser?._id
    });

    if (studentUser) {
      await Submission.create({
        assignmentId: sampleAssignment._id,
        assignmentTitle: sampleAssignment.title,
        course: sampleAssignment.course,
        studentId: studentUser._id,
        studentName: `${studentUser.firstName} ${studentUser.lastName}`,
        studentEmail: studentUser.email,
        file: 'React_Lab1_Santos.zip',
        status: 'Pending',
        score: null,
        maxScore: 100,
        feedback: '',
        submittedAt: 'Oct 05, 2026 • 9:30 PM'
      });
    }

    console.log('Database seeded successfully!');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });