const router = require('express').Router()
const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const { verifyToken } = require('../middleware/authMiddleware')

// 1. Get all created assignments
router.get('/', verifyToken, async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 })
        res.status(200).json(assignments)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch assignments' })
    }
})

// 2. Instructor: Create an assignment
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { title, course, dueDate, points, description } = req.body
        if (!title || !course) {
            return res.status(400).json({ message: 'Title and course are required' })
        }

        const assignment = await Assignment.create({
            title: title.trim(),
            course,
            dueDate: dueDate || 'No Due Date',
            points: Number(points) || 100,
            description: description?.trim() || '',
            instructorId: req.user.id
        })

        res.status(201).json({ message: 'Assignment created successfully', assignment })
    } catch (err) {
        res.status(500).json({ message: 'Failed to create assignment' })
    }
})

// 3. Get all submissions (for grading)
router.get('/submissions', verifyToken, async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ createdAt: -1 })
        res.status(200).json(submissions)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch submissions' })
    }
})

// 4. Grade a submission
router.put('/submissions/grade/:id', verifyToken, async (req, res) => {
    try {
        const { score, feedback } = req.body
        const submission = await Submission.findById(req.params.id)
        if (!submission) return res.status(404).json({ message: 'Submission not found' })

        submission.score = Number(score)
        submission.feedback = feedback || ''
        submission.status = 'Graded'
        await submission.save()

        res.status(200).json({ message: 'Grade saved successfully', submission })
    } catch (err) {
        res.status(500).json({ message: 'Failed to grade submission' })
    }
})

// 5. Student submits work
router.post('/submissions/submit', verifyToken, async (req, res) => {
    try {
        const { assignmentId, assignmentTitle, course, studentName, studentEmail, file } = req.body
        const submission = await Submission.create({
            assignmentId,
            assignmentTitle,
            course,
            studentId: req.user.id,
            studentName,
            studentEmail,
            file: file || 'uploaded_work.pdf',
            submittedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        })
        res.status(201).json({ message: 'Assignment submitted successfully', submission })
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit assignment' })
    }
})

module.exports = router