const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    units: { type: Number, default: 3 },
    semester: { type: String, default: '1st Semester' },
    schedule: { type: String, default: '' },
    room: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)