const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');

    const hashed = await bcrypt.hash('admin123', 10);

    // Remove existing seed accounts so it won't crash on rerun
    await User.deleteMany({
      email: { $in: ['admin2@portal.com', 'instructor@portal.com'] }
    });

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

    console.log('Admin account created: admin@portal.com / admin123')
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });