const router = require('express').Router()

const { getLogs, createLog } = require('../controllers/logsController')

router.get('/logs', getLogs)
router.post('/create/log', createLog)

module.exports = router;