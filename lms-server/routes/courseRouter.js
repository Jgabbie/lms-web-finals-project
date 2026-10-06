const router = require('express').Router()
const Course = require('../models/Course')
const { verifyToken } = require('../middleware/authMiddleware')

// Get all courses (or filtered by instructor)
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('enrolledStudents', 'firstName lastName email').sort({ createdAt: -1 })
        res.status(200).json(courses)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses' })
    }
})

// Create course
router.post('/create', verifyToken, async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            instructorId: req.user.id
        })
        res.status(201).json({ message: 'Course created successfully', course })
    } catch (err) {
        res.status(500).json({ message: 'Failed to create course' })
    }
})

// Enroll students into course
router.post('/enroll', verifyToken, async (req, res) => {
    try {
        const { courseId, studentIds } = req.body
        const course = await Course.findById(courseId)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        // Add students without duplicates
        studentIds.forEach(id => {
            if (!course.enrolledStudents.includes(id)) {
                course.enrolledStudents.push(id)
            }
        })
        await course.save()
        res.status(200).json({ message: 'Students enrolled successfully', course })
    } catch (err) {
        res.status(500).json({ message: 'Enrollment failed' })
    }
})

// Delete course
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Course deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete course' })
    }
})

module.exports = router