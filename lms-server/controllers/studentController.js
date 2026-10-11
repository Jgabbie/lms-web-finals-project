const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const Student = require('../models/Student')

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .select('-password')
            .sort({ name: 1 })

        res.status(200).json(students)
    } catch (error) {
        console.error('Retrieve students error:', error)
        res.status(500).json({ message: 'Failed to retrieve students' })
    }
}


exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('-password')

        if (!student) {
            return res.status(404).json({ message: 'Student not found' })
        }

        res.status(200).json(student)
    } catch (error) {
        console.error('Retrieve student error:', error)
        res.status(500).json({ message: 'Failed to retrieve a student' })
    }
}



exports.addStudent = async (req, res) => {
    try {
        const {
            studentId,
            firstName,
            lastName,
            email,
            course,
            yearLevel,
            status,
        } = req.body;

        const normalizedStudentId = String(studentId).trim().toUpperCase()
        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedCourse = String(course).trim()
        const normalizedYearLevel = String(yearLevel).trim()

        const namePattern = /^[\p{L}]+(?:['\u{2019}]?[\p{L}]+)*$/u

        if (!/^\d{4}-\d{6}$/.test(normalizedStudentId)) {
            return res.status(400).json({
                message: 'Student Number must be in the format YYYY-NNNNNN (e.g., 2023-123456)'
            })
        }

        if (normalizedFirstName.length < 2) {
            return res.status(400).json({
                message: 'First name must be at least 2 characters long'
            })
        }

        if (normalizedFirstName.length > 50) {
            return res.status(400).json({
                message: 'First name must not exceed 50 characters'
            })
        }

        if (!namePattern.test(normalizedFirstName)) {
            return res.status(400).json({
                message: 'First name contains invalid characters'
            })
        }

        if (normalizedLastName.length < 2) {
            return res.status(400).json({
                message: 'Last name must be at least 2 characters long'
            })
        }

        if (normalizedLastName.length > 50) {
            return res.status(400).json({
                message: 'Last name must not exceed 50 characters'
            })
        }

        if (!namePattern.test(normalizedLastName)) {
            return res.status(400).json({
                message: 'Last name contains invalid characters'
            })
        }

        if (normalizedEmail.length < 6) {
            return res.status(400).json({
                message: 'Email must be at least 6 characters long'
            })
        }

        if (normalizedEmail.length > 100) {
            return res.status(400).json({
                message: 'Email must not exceed 100 characters'
            })
        }

        if (normalizedCourse.length < 2) {
            return res.status(400).json({
                message: 'Course must be at least 2 characters long'
            })
        }

        if (normalizedCourse.length > 100) {
            return res.status(400).json({
                message: 'Course must not exceed 100 characters'
            })
        }

        if (normalizedYearLevel.length < 1) {
            return res.status(400).json({
                message: 'Year level must be at least 1 character long'
            })
        }

        if (normalizedYearLevel.length > 10) {
            return res.status(400).json({
                message: 'Year level must not exceed 10 characters'
            })
        }

        const existingStudentId = await Student.findOne({ studentId: studentId.trim() })
        if (existingStudentId) {
            return res.status(400).json({
                message: 'A student with this Student Number already exists'
            })
        }

        const lastStudent = await Student.findOne().sort({ studentId: -1 })

        const existingStudent = await Student.findOne({ email: email.toLowerCase() })
        if (existingStudent) {
            return res.status(400).json({
                message: 'A student with this email already exists'
            })
        }

        const temporaryPassword = crypto.randomBytes(6).toString('base64url')

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

        const student = new Student({
            studentId: normalizedStudentId,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            password: hashedPassword,
            course: normalizedCourse,
            yearLevel: normalizedYearLevel,
            status: status || 'active',
            role: 'student',
        })

        await student.save()

        res.status(201).json({
            message: 'Student added successfully',
            student: {
                id: student._id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                course: student.course,
                yearLevel: student.yearLevel,
                status: student.status,
                role: student.role,
                temporaryPassword: temporaryPassword
            }
        })
    } catch (error) {
        console.error('Add student error:', error)

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'A student with this email already exists'
            })
        }

        res.status(500).json({ message: 'Failed to add a student' })
    }
}




exports.updateStudent = async (req, res) => {
    try {
        const {
            studentId,
            firstName,
            lastName,
            email,
            course,
            yearLevel,
            status,
        } = req.body

        const student = await Student.findById(req.params.id)

        if (!student) {
            return res.status(404).json({ message: 'Student not found' })
        }

        const normalizedStudentId = String(studentId).trim().toUpperCase()
        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedCourse = String(course).trim()
        const normalizedYearLevel = String(yearLevel).trim()

        const namePattern = /^[\p{L}]+(?:['\u{2019}]?[\p{L}]+)*$/u

        if (!/^\d{4}-\d{6}$/.test(normalizedStudentId)) {
            return res.status(400).json({
                message: 'Student Number must be in the format YYYY-NNNNNN (e.g., 2023-123456)'
            })
        }

        if (normalizedFirstName.length < 2) {
            return res.status(400).json({
                message: 'First name must be at least 2 characters long'
            })
        }

        if (normalizedFirstName.length > 50) {
            return res.status(400).json({
                message: 'First name must not exceed 50 characters'
            })
        }

        if (!namePattern.test(normalizedFirstName)) {
            return res.status(400).json({
                message: 'First name contains invalid characters'
            })
        }

        if (normalizedLastName.length < 2) {
            return res.status(400).json({
                message: 'Last name must be at least 2 characters long'
            })
        }

        if (normalizedLastName.length > 50) {
            return res.status(400).json({
                message: 'Last name must not exceed 50 characters'
            })
        }

        if (!namePattern.test(normalizedLastName)) {
            return res.status(400).json({
                message: 'Last name contains invalid characters'
            })
        }

        if (normalizedEmail.length < 6) {
            return res.status(400).json({
                message: 'Email must be at least 6 characters long'
            })
        }

        if (normalizedEmail.length > 100) {
            return res.status(400).json({
                message: 'Email must not exceed 100 characters'
            })
        }

        if (normalizedCourse.length < 2) {
            return res.status(400).json({
                message: 'Course must be at least 2 characters long'
            })
        }

        if (normalizedCourse.length > 100) {
            return res.status(400).json({
                message: 'Course must not exceed 100 characters'
            })
        }

        if (normalizedYearLevel.length < 1) {
            return res.status(400).json({
                message: 'Year level must be at least 1 character long'
            })
        }

        if (normalizedYearLevel.length > 10) {
            return res.status(400).json({
                message: 'Year level must not exceed 10 characters'
            })
        }

        const existingStudentId = await Student.findOne({ studentId: studentId.trim() })
        if (existingStudentId) {
            return res.status(400).json({
                message: 'A student with this Student Number already exists'
            })
        }

        await student.save()

        res.status(200).json({
            message: 'Student updated successfully'
        })
    } catch (error) {
        console.error('Update student error: ', error)
        res.status(500).json({ message: 'Failed to update student' })
    }
}



exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id)

        if (!student) {
            return res.status(404).json({ message: 'Student not found' })
        }

        res.status(200).json({ message: 'Student deleted successfully' })
    } catch (error) {
        console.error('Delete student error: ', error)
        res.status(500).json({ message: 'Failed to delete student' })
    }
}

