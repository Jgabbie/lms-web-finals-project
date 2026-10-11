const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllCourses,
    getMyEnrolledCourses,
    createCourse,
    enrollStudents,
    unenrollStudent,
    deleteCourse
} = require('../controllers/courseController')

router.get('/my-courses', verifyToken, getMyEnrolledCourses)
router.get('/', getAllCourses)
router.post('/create', verifyToken, createCourse)
router.post('/enroll', verifyToken, enrollStudents)
router.post('/unenroll', verifyToken, unenrollStudent)
router.delete('/:id', verifyToken, deleteCourse)

module.exports = router