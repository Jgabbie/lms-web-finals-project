const router = require('express').Router()
const { getStudents, getStudent, addStudent, updateStudent, deleteStudent, restoreStudent, getArchivedStudents } = require('../controllers/studentController')

router.get('/', getStudents)
router.get('/:id', getStudent)
router.post('/', addStudent)
router.put('/:id', updateStudent)
router.delete('/:id', deleteStudent)
router.post('/restore/:id', restoreStudent)
router.get('/archived', getArchivedStudents)
module.exports = router;