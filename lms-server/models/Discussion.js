const mongoose = require('mongoose')

const discussionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    replies: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['Open', 'Answered'], default: 'Open' }
}, { timestamps: true })

module.exports = mongoose.model('Discussion', discussionSchema)
