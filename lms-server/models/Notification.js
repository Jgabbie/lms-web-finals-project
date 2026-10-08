const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Assignment', 'Announcement', 'Grade', 'Quiz', 'Schedule', 'Course', 'Material'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    course: { type: String, default: '' },
    sourceType: { type: String, required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

notificationSchema.index({ userId: 1, sourceType: 1, sourceId: 1 }, { unique: true })

module.exports = mongoose.model('Notification', notificationSchema)
