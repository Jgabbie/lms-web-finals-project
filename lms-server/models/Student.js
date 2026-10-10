const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    course: { type: String, required: true },
    yearLevel: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    role: { type: String, enum: ['student'], default: 'student' },
    profileImage: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Student', studentSchema)