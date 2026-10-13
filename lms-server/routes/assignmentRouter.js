const router = require('express').Router()
const multer = require('multer')
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getSubmissions,
    gradeSubmission,
    submitAssignment
} = require('../controllers/assignmentController')

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
})

router.use(verifyToken)

router.get('/', verifyToken, getAllAssignments)
router.post('/create', verifyToken, upload.single('attachment'), createAssignment)
router.put('/:id', verifyToken, upload.single('attachment'), updateAssignment)
router.delete('/:id', verifyToken, deleteAssignment)

router.get('/submissions', verifyToken, getSubmissions)
router.put('/submissions/grade/:id', verifyToken, gradeSubmission)

// Add multer middleware here:
router.post('/submissions/submit', verifyToken, upload.single('file'), submitAssignment)

module.exports = router