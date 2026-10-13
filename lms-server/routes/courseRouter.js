const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllCourses,
    getMyEnrolledCourses,
    getCourseDetails,
    updateCourseOverview,
    addModule,
    deleteModule,
    addLesson,
    deleteLesson,
    addAnnouncement,
    deleteAnnouncement,
    createCourse,
    enrollStudents,
    unenrollStudent,
    deleteCourse
} = require('../controllers/courseController')


router.get('/my-courses', verifyToken, getMyEnrolledCourses)
router.get('/', getAllCourses)

// Course details and sub-resource routes
router.get('/:id', verifyToken, getCourseDetails)
router.put('/:id/overview', verifyToken, updateCourseOverview)

router.post('/:id/modules', verifyToken, addModule)
router.delete('/:id/modules/:moduleId', verifyToken, deleteModule)
router.post('/:id/modules/:moduleId/lessons', verifyToken, addLesson)
router.delete('/:id/modules/:moduleId/lessons/:lessonId', verifyToken, deleteLesson)

router.post('/:id/announcements', verifyToken, addAnnouncement)
router.delete('/:id/announcements/:announcementId', verifyToken, deleteAnnouncement)

router.post('/create', verifyToken, createCourse)
router.post('/enroll', verifyToken, enrollStudents)
router.post('/unenroll', verifyToken, unenrollStudent)
router.delete('/:id', verifyToken, deleteCourse)

module.exports = router