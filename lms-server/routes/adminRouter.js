const router = require('express').Router()
const { getDashboardStats, getRecentActivityLogs } = require('../controllers/adminController')

router.get('/dashboard-stats', getDashboardStats)
router.get('/recent-activity-logs', getRecentActivityLogs)
module.exports = router