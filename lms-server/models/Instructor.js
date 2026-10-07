const mongoose = require('mongoose')

const instructorSchema = new mongoose.Schema({
    instructorId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    specialization: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    role: { type: String, enum: ['admin', 'instructor'], default: 'instructor' },
    profileImage: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Instructor', instructorSchema)