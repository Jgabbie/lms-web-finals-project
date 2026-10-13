const Course = require('../models/Course')
const Log = require('../models/Log')
const mongoose = require('mongoose')

const logActivity = async (req, action, description) => {
    const actorId = req.user?.id || req.user?._id

    if (!actorId) {
        throw new Error('Actor ID is missing in the request')
    }

    const actor = await User.findById(actorId).select('firstName lastName role')

    if (!actor) {
        throw new Error('Actor not found')
    }

    await Log.create({
        firstName: actor.firstName,
        lastName: actor.lastName,
        role: actor.role,
        action,
        description,
        status: 'Success'
    })
}

// 1. Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('enrolledStudents', 'firstName lastName email')
            .sort({ createdAt: -1 })
        res.status(200).json(courses)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses' })
    }
}

// 2. Student: Get enrolled courses
exports.getMyEnrolledCourses = async (req, res) => {
    try {
        const studentObjectId = new mongoose.Types.ObjectId(req.user.id)
        const courses = await Course.find({
            enrolledStudents: studentObjectId
        }).sort({ createdAt: -1 })

        res.status(200).json(courses)
    } catch (err) {
        console.error('Fetch enrolled courses error:', err)
        res.status(500).json({ message: 'Failed to fetch enrolled courses' })
    }
}

// 3. Get single course details by ID
exports.getCourseDetails = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid course ID' })
        }
        const course = await Course.findById(req.params.id)
            .populate('enrolledStudents', 'firstName lastName email')
        if (!course) return res.status(404).json({ message: 'Course not found' })
        res.status(200).json(course)
    } catch (err) {
        console.error('Fetch course details error:', err)
        res.status(500).json({ message: 'Failed to fetch course details' })
    }
}

// 4. Update course overview
exports.updateCourseOverview = async (req, res) => {
    try {
        const { description, learningObjectives, schedule, room } = req.body
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { description, learningObjectives, schedule, room },
            { new: true }
        )

        await logActivity(
            req,
            'Update',
            `Updated course overview for "${course.courseName}"`
        )

        res.status(200).json({ message: 'Course updated', course })
    } catch (err) {
        res.status(500).json({ message: 'Failed to update overview' })
    }
}

// 5. Add Module
exports.addModule = async (req, res) => {
    try {
        const { title } = req.body
        if (!title) return res.status(400).json({ message: 'Module title is required' })
        const course = await Course.findById(req.params.id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        course.modules = course.modules || []
        course.modules.push({ title, lessons: [] })

        await logActivity(
            req,
            'Create',
            `Created module for course "${course.courseName}"`
        )

        await course.save()
        res.status(201).json({ message: 'Module added', modules: course.modules })
    } catch (err) {
        res.status(500).json({ message: 'Failed to add module' })
    }
}

// 6. Delete Module
exports.deleteModule = async (req, res) => {
    try {
        const { id, moduleId } = req.params
        const course = await Course.findById(id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        course.modules = (course.modules || []).filter(m => String(m._id) !== String(moduleId))

        await logActivity(
            req,
            'Delete',
            `Deleted module for course "${course.courseName}"`
        )

        await course.save()
        res.status(200).json({ message: 'Module removed', modules: course.modules })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete module' })
    }
}

// 7. Add Lesson
exports.addLesson = async (req, res) => {
    try {
        const { id, moduleId } = req.params
        const { title, duration, videoUrl } = req.body
        if (!title) return res.status(400).json({ message: 'Lesson title is required' })

        const course = await Course.findById(id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        const targetModule = course.modules.id(moduleId)
        if (!targetModule) return res.status(404).json({ message: 'Module not found' })

        targetModule.lessons.push({
            title,
            duration: duration || '15 min',
            videoUrl: videoUrl || ''
        })
        await course.save()

        await logActivity(
            req,
            'Create',
            `Created lesson for course "${course.courseName}"`
        )
        res.status(201).json({ message: 'Lesson added', modules: course.modules })
    } catch (err) {
        res.status(500).json({ message: 'Failed to add lesson' })
    }
}

// 8. Delete Lesson
exports.deleteLesson = async (req, res) => {
    try {
        const { id, moduleId, lessonId } = req.params
        const course = await Course.findById(id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        const targetModule = course.modules.id(moduleId)
        if (!targetModule) return res.status(404).json({ message: 'Module not found' })

        targetModule.lessons = targetModule.lessons.filter(l => String(l._id) !== String(lessonId))

        await logActivity(
            req,
            'Delete',
            `Deleted lesson for course "${course.courseName}"`
        )

        await course.save()
        res.status(200).json({ message: 'Lesson removed', modules: course.modules })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete lesson' })
    }
}

// 9. Add Announcement
exports.addAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body
        if (!title || !content) return res.status(400).json({ message: 'Title and content are required' })

        const course = await Course.findById(req.params.id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        course.announcements = course.announcements || []
        course.announcements.unshift({
            title,
            content,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        })
        await course.save()

        await logActivity(
            req,
            'Create',
            `Created announcement for course "${course.courseName}"`
        )
        res.status(201).json({ message: 'Announcement created', announcements: course.announcements })
    } catch (err) {
        res.status(500).json({ message: 'Failed to post announcement' })
    }
}

// 10. Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id, announcementId } = req.params
        const course = await Course.findById(id)
        if (!course) return res.status(404).json({ message: 'Course not found' })

        course.announcements = (course.announcements || []).filter(a => String(a._id) !== String(announcementId))

        await logActivity(
            req,
            'Delete',
            `Deleted announcement for course "${course.courseName}"`
        )

        await course.save()
        res.status(200).json({ message: 'Announcement removed', announcements: course.announcements })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete announcement' })
    }
}

const User = require('../models/User')

exports.createCourse = async (req, res) => {
    try {
        let instructorName = req.body.instructor

        // Fetch instructor name from the database user record if empty or placeholder
        if (!instructorName || instructorName === 'Instructor Portal') {
            const user = await User.findById(req.user.id)
            if (user) {
                instructorName = `${user.firstName} ${user.lastName}`.trim()
            }
        }

        const course = await Course.create({
            ...req.body,
            instructor: instructorName || 'Instructor',
            instructorId: req.user.id
        })

        await logActivity(
            req,
            'Create',
            `Created course named "${course.courseName}" by ${instructorName}`
        )

        res.status(201).json({ message: 'Course created successfully', course })
    } catch (err) {
        res.status(500).json({ message: 'Failed to create course' })
    }
}

// 12. Enroll Students
exports.enrollStudents = async (req, res) => {
    try {
        const { courseId, studentIds } = req.body
        if (!courseId || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Course ID and student IDs are required' })
        }
        const objectStudentIds = studentIds.map(id => new mongoose.Types.ObjectId(id))
        const course = await Course.findByIdAndUpdate(
            courseId,
            { $addToSet: { enrolledStudents: { $each: objectStudentIds } } },
            { new: true }
        ).populate('enrolledStudents', 'firstName lastName email')
        if (!course) return res.status(404).json({ message: 'Course not found' })


        await logActivity(
            req,
            'Enroll',
            `Enrolled student in course "${course.courseName}"`
        )

        res.status(200).json({ message: 'Students enrolled successfully', course })
    } catch (err) {
        console.error('Enroll error:', err)
        res.status(500).json({ message: 'Enrollment failed' })
    }
}

// 13. Unenroll Student
exports.unenrollStudent = async (req, res) => {
    try {
        const { courseId, studentId } = req.body
        if (!courseId || !studentId) {
            return res.status(400).json({ message: 'Course ID and Student ID are required' })
        }
        const normalizedStudentId = String(studentId._id || studentId)
        const objectStudentId = mongoose.isValidObjectId(normalizedStudentId)
            ? new mongoose.Types.ObjectId(normalizedStudentId)
            : normalizedStudentId
        const course = await Course.findByIdAndUpdate(
            courseId,
            {
                $pull: {
                    enrolledStudents: {
                        $in: [objectStudentId, normalizedStudentId]
                    }
                }
            },
            { new: true }
        ).populate('enrolledStudents', 'firstName lastName email')
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        await logActivity(
            req,
            'Unenroll',
            `Unenrolled student from course "${course.courseName}"`
        )

        res.status(200).json({ message: 'Student unenrolled successfully', course })
    } catch (err) {
        console.error('Unenroll error:', err)
        res.status(500).json({ message: err.message || 'Failed to unenroll student' })
    }
}

// 14. Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id)

        await logActivity(
            req,
            'Delete',
            `Deleted course "${course.courseName}"`
        )

        res.status(200).json({ message: 'Course deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete course' })
    }
}