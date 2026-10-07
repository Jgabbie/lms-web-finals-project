const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: String, default: 'No Due Date' },
    points: { type: Number, default: 100 },
    description: { type: String, default: '' }
}, { timestamps: true })

module.exports = mongoose.model('Assignment', assignmentSchema)