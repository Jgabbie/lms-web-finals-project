const Student = require('../models/Student')
const Instructor = require('../models/Instructor')
const Course = require('../models/Course')
const Log = require('../models/Log')


exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        const [
            totalStudents,
            activeStudents,
            totalInstructors,
            activeInstructors,
            totalCourses,
            activeCourses,
            monthlyRegistrations,
            yearlyRegistrations,
            recentStudents,
            popularCourses,
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ status: 'active' }),
            Instructor.countDocuments(),
            Instructor.countDocuments({ status: 'active' }),
            Course.countDocuments(),
            Course.countDocuments({ status: 'active' }),
            Student.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Student.aggregate([
                { $match: { createdAt: { $gte: startOfYear } } },
                { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
            ]),
            Student.find().select('firstName lastName email course status createdAt').sort({ createdAt: -1 }).limit(5).lean(),
            Course.aggregate([
                { $match: { status: 'active' } },
                {
                    $project: {
                        courseCode: 1,
                        courseName: 1,
                        enrollmentCount: {
                            $size: {
                                $ifNull: ['$enrolledStudents', []]
                            }
                        }
                    }
                },
                {
                    $sort: { enrollmentCount: -1 }
                },
                { $limit: 5 }
            ]),
        ])

        const enrollmentOverview = Array.from(
            { length: 12 },
            (_, index) => {
                const month = index + 1
                const result = yearlyRegistrations.find(
                    item => item._id === month
                )

                return {
                    month: new Date(
                        now.getFullYear(),
                        index,
                        1
                    ).toLocaleString('default', {
                        month: 'short'
                    }),
                    enrollments: result ? result.count : 0,
                }
            }
        )

        res.status(200).json({
            success: true,
            statistics: {
                totalStudents,
                activeStudents,
                inactiveStudents: totalStudents - activeStudents,
                totalInstructors,
                activeInstructors,
                totalCourses,
                activeCourses,
                monthlyRegistrations,
            },
            enrollmentOverview,
            recentStudents,
            popularCourses,
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching dashboard statistics.',
        })
    }
}

exports.getRecentActivityLogs = async (req, res) => {
    try {
        const logs = await Log.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()

        const formattedLogs = logs.map(log => ({
            id: log._id.toString(),
            user: `${log.firstName || 'Unknown'} ${log.lastName || 'User'}`,
            initials: `${(log.firstName || 'Unknown').charAt(0)}${(log.lastName || 'User').charAt(0)}`.toUpperCase(),
            role: log.role
                ? log.role.charAt(0).toUpperCase() + log.role.slice(1)
                : 'User',
            action: log.action,
            description: log.description,
            date: new Date(log.timestamp || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }),
            time: new Date(log.timestamp || Date.now()).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
            status: log.status,
            timestamp: new Date(log.timestamp || Date.now()),
        }))

        return res.status(200).json({
            success: true,
            logs: formattedLogs,
        })
    } catch (error) {
        console.error('Error fetching activity logs:', error)
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching activity logs.',
        })
    }
}
