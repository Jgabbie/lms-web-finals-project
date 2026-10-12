const Course = require('../models/Course')
const mongoose = require('mongoose')


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


exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create({
            ...req.body,
            instructorId: req.user.id
        })
        res.status(201).json({ message: 'Course created successfully', course })
    } catch (err) {
        res.status(500).json({ message: 'Failed to create course' })
    }
}


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

        res.status(200).json({ message: 'Students enrolled successfully', course })
    } catch (err) {
        console.error('Enroll error:', err)
        res.status(500).json({ message: 'Enrollment failed' })
    }
}

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

        res.status(200).json({ message: 'Student unenrolled successfully', course })
    } catch (err) {
        console.error('Unenroll error:', err)
        res.status(500).json({ message: err.message || 'Failed to unenroll student' })
    }
}


exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Course deleted successfully' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete course' })
    }
}