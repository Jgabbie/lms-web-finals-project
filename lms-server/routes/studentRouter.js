const router = require('express').Router()
const { getStudents, getStudent, addStudent, updateStudent, deleteStudent, restoreStudent, getArchivedStudents } = require('../controllers/studentController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.post('/restore/:id', restoreStudent)
router.get('/archived', getArchivedStudents)

router.get('/', getStudents)
router.get('/:id', getStudent)
router.post('/', addStudent)
router.put('/:id', updateStudent)
router.delete('/:id', deleteStudent)

module.exports = router;