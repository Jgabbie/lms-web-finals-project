const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student', 'instructor'], required: true },
    action: {
        type: String,
        enum: [
            'Login',
            'Logout',
            'Create',
            'Update',
            'Delete',
        ],
        required: true
    },
    description: { type: String, required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Log', logSchema)