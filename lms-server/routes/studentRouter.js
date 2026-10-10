const router = require('express').Router()
const { getStudents, getStudent, addStudent, updateStudent, deleteStudent } = require('../controllers/studentController')

router.get('/students', getStudents)
router.get('/student/:id', getStudent)
router.post('/add/students', addStudent)
router.put('/update/students/:id', updateStudent)
router.delete('/delete/students/:id', deleteStudent)

module.exports = router;