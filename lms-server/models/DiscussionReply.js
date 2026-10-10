const mongoose = require('mongoose')

const discussionReplySchema = new mongoose.Schema({
    discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

module.exports = mongoose.model('DiscussionReply', discussionReplySchema)
