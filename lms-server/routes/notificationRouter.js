const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification
} = require('../controllers/notificationController')

router.use(verifyToken)
router.get('/', getNotifications)
router.patch('/read-all', markAllNotificationsRead)
router.patch('/:id/read', markNotificationRead)
router.delete('/:id', deleteNotification)

module.exports = router
