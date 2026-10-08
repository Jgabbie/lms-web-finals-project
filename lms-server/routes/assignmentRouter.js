const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllAssignments,
    createAssignment,
    getSubmissions,
    gradeSubmission,
    submitAssignment
} = require('../controllers/assignmentController')

router.get('/', verifyToken, getAllAssignments)
router.post('/create', verifyToken, createAssignment)
router.get('/submissions', verifyToken, getSubmissions)
router.put('/submissions/grade/:id', verifyToken, gradeSubmission)
router.post('/submissions/submit', verifyToken, submitAssignment)

module.exports = router