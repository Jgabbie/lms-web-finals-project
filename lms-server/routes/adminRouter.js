const router = require('express').Router()
const { getDashboardStats, getEnrollmentOverview, getRecentActivityLogs } = require('../controllers/adminController')
const { verifyToken } = require('../middleware/authMiddleware')

router.use(verifyToken)
router.get('/dashboard-stats', getDashboardStats)
router.get('/enrollment-overview', getEnrollmentOverview)
router.get('/recent-activity-logs', getRecentActivityLogs)
module.exports = router