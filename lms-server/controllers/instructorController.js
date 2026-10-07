const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const Instructor = require('../models/Instructor')

exports.getInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find()
            .select('-password')
            .sort({ name: 1 })

        res.status(200).json(instructors)
    } catch (error) {
        console.error('Retrieve instructors error:', error)
        res.status(500).json({ message: 'Failed to retrieve instructors' })
    }
}


exports.getInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id).select('-password')

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' })
        }

        res.status(200).json(instructor)
    } catch (error) {
        console.error('Retrieve instructor error:', error)
        res.status(500).json({ message: 'Failed to retrieve an instructor' })
    }
}


exports.addInstructor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            department,
            specialization,
            status,
        } = req.body;

        if (!firstName || !lastName || !email || !department || !specialization) {
            return res.status(400).json({ message: 'All fields are required' })
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

        if (!department.trim()) {
            return res.status(400).json({
                message: 'Department is required'
            })
        }

        if (!specialization.trim()) {
            return res.status(400).json({
                message: 'Specialization is required'
            })
        }

        const lastInstructor = await Instructor.findOne().sort({ instructorId: -1 })

        let newInstructorId = 'INST001'
        if (lastInstructor) {
            const lastIdNumber = parseInt(lastInstructor.instructorId.replace('INST', ''))
            const nextIdNumber = lastIdNumber + 1
            newInstructorId = `INST${nextIdNumber.toString().padStart(3, '0')}`
        }

        const instructorId = newInstructorId

        const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() })
        if (existingInstructor) {
            return res.status(400).json({
                message: 'An instructor with this email already exists'
            })
        }

        const temporaryPassword = crypto.randomBytes(6).toString('base64url')

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

        const instructor = new Instructor({
            instructorId: instructorId.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            department: department.trim(),
            specialization: specialization.trim(),
            status: status || 'active',
            role: role || 'instructor',
        })

        res.status(201).json({
            message: 'Instructor added successfully',
            instructor: {
                id: instructor._id,
                instructorId: instructor.instructorId,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                email: instructor.email,
                department: instructor.department,
                specialization: instructor.specialization,
                status: instructor.status,
                role: instructor.role,
                temporaryPassword: temporaryPassword
            }
        })
    } catch (error) {
        console.error('Add instructor error:', error)

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An instructor with this email already exists'
            })
        }

        res.status(500).json({ message: 'Failed to add an instructor' })
    }
}



exports.updateInstructor = async (req, res) => {
    try {
        const {
            instructorId,
            firstName,
            lastName,
            email,
            department,
            specialization,
            status,
        } = req.body

        const instructor = await Instructor.findOne({ instructorId: instructorId.trim() })

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' })
        }

        if (instructorId !== undefined) {
            const existing = await Instructor.findOne({
                instructorId: instructorId.trim(),
                _id: { $ne: instructor._id }
            })

            if (existing) {
                return res.status(409).json({
                    message: 'An instructor with this ID already exists'
                })
            }

            instructor.instructorId = instructorId.trim()
        }

        if (firstName !== undefined) {
            if (!firstName.trim()) {
                return res.status(400).json({ message: 'First Name is required' })
            }
            instructor.firstName = firstName.trim()
        }

        if (lastName !== undefined) {
            if (!lastName.trim()) {
                return res.status(400).json({ message: 'Last Name is required' })
            }
            instructor.lastName = lastName.trim()
        }

        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase()
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                return res.status(400).json({ message: 'Please enter a valid email' })
            }

            const existing = await Instructor.findOne({
                email: normalizedEmail,
                _id: { $ne: instructor._id }
            })

            if (existing) {
                return res.status(409).json({
                    message: 'An instructor with this email already exists'
                })
            }

            instructor.email = normalizedEmail
        }

        if (department !== undefined) {
            instructor.department = department.trim()
        }

        if (specialization !== undefined) {
            instructor.specialization = specialization.trim()
        }

        if (status !== undefined) {
            instructor.status = status.toLowerCase()
        }

        await instructor.save()

        res.status(200).json({
            message: 'Instructor updated successfully'
        })
    } catch (error) {
        console.error('Update instructor error: ', error)
        res.status(500).json({ message: 'Failed to update instructor' })
    }
}


exports.deleteInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndDelete(req.params.id)

        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' })
        }

        await Instructor.findByIdAndDelete(req.params.id)

        res.status(200).json({ message: 'Instructor deleted successfully' })
    } catch (error) {
        console.error('Delete instructor error: ', error)
        res.status(500).json({ message: 'Failed to delete instructor' })
    }
}

