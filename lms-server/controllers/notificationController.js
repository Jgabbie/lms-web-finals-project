const Assignment = require('../models/Assignment')
const Course = require('../models/Course')
const Material = require('../models/Material')
const Notification = require('../models/Notification')

const syncStudentNotifications = async (userId) => {
    const courses = await Course.find({ enrolledStudents: userId })
        .select('_id courseName courseCode createdAt')
        .lean()

    const courseIds = courses.map(course => course._id)
    const courseNames = courses.flatMap(course => [course.courseName, course.courseCode]).filter(Boolean)

    const [assignments, materials] = await Promise.all([
        Assignment.find({
            $or: [
                { courseId: { $in: courseIds } },
                { course: { $in: courseNames } }
            ]
        }).select('_id title course createdAt').lean(),
        Material.find({
            $or: [
                { courseId: { $in: courseIds } },
                { course: { $in: courseNames } }
            ]
        }).select('_id title course createdAt').lean()
    ])

    const notifications = [
        ...courses.map(course => ({
            userId,
            type: 'Course',
            title: 'You joined a new course',
            message: `${course.courseName} is now available in your courses.`,
            course: course.courseName,
            sourceType: 'Course',
            sourceId: course._id,
            createdAt: course.createdAt
        })),
        ...assignments.map(assignment => ({
            userId,
            type: 'Assignment',
            title: 'New Assignment Posted',
            message: `${assignment.title} was posted for ${assignment.course}.`,
            course: assignment.course,
            sourceType: 'Assignment',
            sourceId: assignment._id,
            createdAt: assignment.createdAt
        })),
        ...materials.map(material => ({
            userId,
            type: 'Announcement',
            title: 'New Learning Material',
            message: `${material.title} is available in ${material.course}.`,
            course: material.course,
            sourceType: 'Material',
            sourceId: material._id,
            createdAt: material.createdAt
        }))
    ]

    await Promise.all(notifications.map(notification =>
        Notification.updateOne(
            {
                userId: notification.userId,
                sourceType: notification.sourceType,
                sourceId: notification.sourceId
            },
            { $setOnInsert: notification },
            { upsert: true }
        )
    ))
}

exports.getNotifications = async (req, res) => {
    try {
        await syncStudentNotifications(req.user.id)

        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean()

        return res.status(200).json({
            notifications: notifications.map(notification => ({
                ...notification,
                id: notification._id,
                unread: !notification.read,
                time: notification.createdAt
            }))
        })
    } catch (error) {
        console.error('Get notifications error:', error)
        return res.status(500).json({ message: 'Unable to load notifications' })
    }
}

exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        return res.status(200).json({ notification })
    } catch (error) {
        console.error('Mark notification read error:', error)
        return res.status(500).json({ message: 'Unable to update notification' })
    }
}

exports.markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, read: false },
            { read: true }
        )

        return res.status(200).json({ message: 'Notifications marked as read' })
    } catch (error) {
        console.error('Mark all notifications read error:', error)
        return res.status(500).json({ message: 'Unable to update notifications' })
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        const result = await Notification.deleteOne({
            _id: req.params.id,
            userId: req.user.id
        })

        if (!result.deletedCount) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        return res.status(204).send()
    } catch (error) {
        console.error('Delete notification error:', error)
        return res.status(500).json({ message: 'Unable to delete notification' })
    }
}
