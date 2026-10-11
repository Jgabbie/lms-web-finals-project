const router = require('express').Router()

const { getAllUsers, getUserById, addUser, updateUser, deleteUser, restoreUser, getArchivedUsers } = require('../controllers/userController')

router.get('/accounts', getAllUsers)
router.get('/account/:id', getUserById)
router.post('/account/add', addUser)
router.put('/account/update/:id', updateUser)
router.delete('/account/delete/:id', deleteUser)
router.get('/accounts/archived', getArchivedUsers)
router.post('/account/restore/:id', restoreUser)

module.exports = router;