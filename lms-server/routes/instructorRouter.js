const router = require('express').Router()
const { getInstructors, getInstructorById, addInstructor, updateInstructor, deleteInstructor } = require('../controllers/instructorController')

router.get('/instructors', getInstructors)
router.get('/instructor/:id', getInstructorById)
router.post('/add/instructors', addInstructor)
router.put('/update/instructors/:id', updateInstructor)
router.delete('/delete/instructors/:id', deleteInstructor)

module.exports = router;