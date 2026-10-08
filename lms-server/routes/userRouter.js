const router = require('express').Router()

const { getAllUsers, getUserById, addUser, updateUser, deleteUser } = require('../controllers/userController')

router.get('/accounts', getAllUsers)
router.get('/account/:id', getUserById)
router.post('/account/add', addUser)
router.put('/account/update/:id', updateUser)
router.delete('/account/delete/:id', deleteUser)

module.exports = router;