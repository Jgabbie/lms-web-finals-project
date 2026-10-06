const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    type: { type: String, enum: ['PDF', 'Presentation', 'Video', 'Document'], default: 'PDF' },
    description: { type: String, default: '' },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: String, default: '1.2 MB' }
}, { timestamps: true })

module.exports = mongoose.model('Material', materialSchema)