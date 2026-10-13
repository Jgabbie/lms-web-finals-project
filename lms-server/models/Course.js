const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: String, default: '15 min' },
    videoUrl: { type: String, default: '' },
    completed: { type: Boolean, default: false }
})

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [lessonSchema]
})

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) }
})

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    instructor: { type: String, required: true },
    instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    units: { type: Number, default: 3 },
    semester: { type: String, default: '1st Semester' },
    schedule: { type: String, default: 'Mon / Wed 1:00 PM - 2:30 PM' },
    room: { type: String, default: 'Computer Lab' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: 'Master fundamental and advanced course concepts through structured lessons and hands-on deliverables.' },
    learningObjectives: [{ type: String }],
    modules: [moduleSchema],
    announcements: [announcementSchema],
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

module.exports = mongoose.model('Course', courseSchema)