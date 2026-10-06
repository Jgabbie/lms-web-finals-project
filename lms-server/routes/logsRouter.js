const router = require('express').Router()
const Log = require('../models/Log')


router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 })
            .lean()

        const formattedLogs = logs.map(log => ({
            id: log._id,
            user: `${log.firstName} ${log.lastName}`,
            initials: `${log.firstName.charAt(0)}${log.lastName.charAt(0)}`,
            role: log.role === 'admin' ? 'Administrator' : log.role === 'student' ? 'Student' : 'Instructor',
            action: log.action,
            description: log.description,
            date: new Date(log.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: new Date(log.timestamp).toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
            status: log.status
        }))

        return res.status(200).json({
            logs: formattedLogs
        })

    } catch (error) {
        console.error('Get active logs error: ', error)

        return res.status(500).json({
            message: 'Unable to retrieve logs. Please try again later.'
        })
    }
})


router.post('/create/log', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            role,
            action,
            description,
            status
        } = req.body;

        if (!firstName || !lastName || !role || !action || !description || !status) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        const log = new Log.create({
            firstName,
            lastName,
            role,
            action,
            description,
            status: status || 'Success'
        })

        res.status(201).json({
            message: 'Activity Log created successfully',
            log
        })

    } catch (error) {
        console.error('Create activity log error: ', error)

        return res.status(500).json({
            message: 'Unable to create activity log. Please try again.'
        })
    }
})

module.exports = router;