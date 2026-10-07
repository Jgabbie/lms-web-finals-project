const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    assignmentTitle: { type: String, required: true },
    course: { type: String, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    file: { type: String, default: 'submission.zip' },
    status: { type: String, enum: ['Pending', 'Graded'], default: 'Pending' },
    score: { type: Number, default: null },
    maxScore: { type: Number, default: 100 },
    feedback: { type: String, default: '' },
    submittedAt: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('Submission', submissionSchema)