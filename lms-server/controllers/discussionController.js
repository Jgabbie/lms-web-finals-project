const mongoose = require('mongoose')
const Course = require('../models/Course')
const Discussion = require('../models/Discussion')
const DiscussionReply = require('../models/DiscussionReply')

exports.getDiscussions = async (req, res) => {
    try {
        const discussions = await Discussion.find()
            .populate('course', 'courseName courseCode')
            .populate('author', 'firstName lastName')
            .sort({ createdAt: -1 })

        res.status(200).json(discussions)
    } catch (err) {
        console.error('Fetch discussions error:', err)
        res.status(500).json({ message: 'Failed to fetch discussions' })
    }
}

exports.createDiscussion = async (req, res) => {
    try {
        const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
        const courseId = req.body.courseId

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' })
        }

        if (courseId && !mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ message: 'Invalid course' })
        }

        let course = null
        if (courseId) {
            course = await Course.findById(courseId)
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
        }

        const discussion = await Discussion.create({
            title,
            content,
            course: course?._id || null,
            author: req.user.id
        })

        const populatedDiscussion = await discussion.populate([
            { path: 'course', select: 'courseName courseCode' },
            { path: 'author', select: 'firstName lastName' }
        ])

        res.status(201).json(populatedDiscussion)
    } catch (err) {
        console.error('Create discussion error:', err)
        res.status(500).json({ message: 'Failed to create discussion' })
    }
}

exports.getReplies = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid discussion' })
        }

        const replies = await DiscussionReply.find({ discussion: req.params.id })
            .populate('author', 'firstName lastName')
            .sort({ createdAt: 1 })

        res.status(200).json(replies)
    } catch (err) {
        console.error('Fetch discussion replies error:', err)
        res.status(500).json({ message: 'Failed to fetch replies' })
    }
}

exports.createReply = async (req, res) => {
    try {
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : ''
        if (!content) {
            return res.status(400).json({ message: 'Reply content is required' })
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid discussion' })
        }

        const discussion = await Discussion.findById(req.params.id)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        const reply = await DiscussionReply.create({
            discussion: discussion._id,
            content,
            author: req.user.id
        })

        await Discussion.findByIdAndUpdate(discussion._id, {
            $inc: { replies: 1 }
        })

        const populatedReply = await reply.populate('author', 'firstName lastName')
        res.status(201).json(populatedReply)
    } catch (err) {
        console.error('Create discussion reply error:', err)
        res.status(500).json({ message: 'Failed to create reply' })
    }
}
