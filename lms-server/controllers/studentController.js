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

        if (!studentId || !firstName || !lastName || !email || !course || !yearLevel || !status) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (!studentId.trim()) {
            return res.status(400).json({
                message: 'Student ID is required'
            })
        }

        const studentIdPattern = /^[A-Za-z0-9]+$/
        if (!studentIdPattern.test(studentId)) {
            return res.status(400).json({
                message: 'Student ID can only contain letters and numbers'
            })
        }

        const existingStudentId = await Student.findOne({ studentId: studentId.trim() })
        if (existingStudentId) {
            return res.status(400).json({
                message: 'A student with this ID already exists'
            })
        }


        if (!firstName.trim()) {
            return res.status(400).json({
                message: 'First name is required'
            })
        }

        if (!lastName.trim()) {
            return res.status(400).json({
                message: 'Last name is required'
            })
        }

        if (!email.trim()) {
            return res.status(400).json({
                message: 'Email is required'
            })
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        if (!course.trim()) {
            return res.status(400).json({
                message: 'Course is required'
            })
        }

        if (!yearLevel.trim()) {
            return res.status(400).json({
                message: 'Year level is required'
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
            studentId: studentId.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            course: course.trim(),
            yearLevel: yearLevel.trim(),
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

        if (studentId !== undefined) {
            const normalizedStudentId = String(studentId).trim().toUpperCase()
            if (!normalizedStudentId) {
                return res.status(400).json({ message: 'Student ID is required' })
            }

            const existing = await Student.findOne({
                studentId: normalizedStudentId,
                _id: { $ne: student._id }
            })

            if (existing) {
                return res.status(409).json({
                    message: 'A student with this ID already exists'
                })
            }

            student.studentId = normalizedStudentId
        }

        if (firstName !== undefined) {
            if (!firstName.trim()) {
                return res.status(400).json({ message: 'First Name is required' })
            }
            student.firstName = firstName.trim()
        }

        if (lastName !== undefined) {
            if (!lastName.trim()) {
                return res.status(400).json({ message: 'Last Name is required' })
            }
            student.lastName = lastName.trim()
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase()
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                return res.status(400).json({ message: 'Please enter a valid email' })
            }

            const existing = await Student.findOne({
                email: normalizedEmail,
                _id: { $ne: student._id }
            })

            if (existing) {
                return res.status(409).json({
                    message: 'A student with this email already exists'
                })
            }

            student.email = normalizedEmail
        }

        if (department !== undefined) {
            student.department = department.trim()
        }

        if (specialization !== undefined) {
            student.specialization = specialization.trim()
        }

        if (status !== undefined) {
            student.status = status.toLowerCase()
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

        await Student.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'Student deleted successfully' })
    } catch (error) {
        console.error('Delete student error: ', error)
        res.status(500).json({ message: 'Failed to delete student' })
    }
}

