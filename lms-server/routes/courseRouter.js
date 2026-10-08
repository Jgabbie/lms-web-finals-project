const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')

const { getAllCourses, createCourse, enrollStudents, deleteCourse } = require('../controllers/courseController')

// Get all courses (or filtered by instructor)
router.get('/', getAllCourses)
router.post('/create', verifyToken, createCourse)
router.post('/enroll', verifyToken, enrollStudents)
router.delete('/:id', verifyToken, deleteCourse)

module.exports = router