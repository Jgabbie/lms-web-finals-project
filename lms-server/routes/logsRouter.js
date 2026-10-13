const router = require('express').Router()

const { getLogs, createLog } = require('../controllers/logsController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)

router.get('/logs', getLogs)
router.post('/create/log', createLog)

module.exports = router;