const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ name: 1 })

        res.status(200).json(users)
    } catch (error) {
        console.error('Retrieve users error:', error)
        res.status(500).json({ message: 'Failed to retrieve users' })
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json(user)
    } catch (error) {
        console.error('Retrieve users error:', error)
        res.status(500).json({ message: 'Failed to retrieve a user' })
    }
}


exports.addUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            role,
        } = req.body;

        if (typeof firstName !== 'string' || !firstName.trim()) {
            return res.status(400).json({
                message: 'First name is required'
            })
        }

        const cleanFirstName = firstName.trim()

        if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(cleanFirstName)) {
            return res.status(400).json({
                message: 'Please enter a valid first name'
            })
        }


        if (typeof lastName !== 'string' || !lastName.trim()) {
            return res.status(400).json({
                message: 'Last name is required'
            })
        }

        const cleanLastName = lastName.trim()

        if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(cleanLastName)) {
            return res.status(400).json({
                message: 'Please enter a valid last name'
            })
        }


        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                message: 'Email is required'
            })
        }

        const cleanEmail = email.trim()
        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        const allowedRoles = ['admin', 'instructor', 'student']
        const normalizedRole = String(role || 'student').toLowerCase()

        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(400).json({ message: 'Invalid role' })
        }

        const existingUser = await User.findOne({
            email: normalizedEmail
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            })
        }

        const generatedPassword = crypto.randomBytes(6).toString('base64url')
        const hashedPassword = await bcrypt.hash(generatedPassword, 10)


        await User.create({
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: normalizedEmail,
            password: hashedPassword,
            role: normalizedRole
        })

        return res.status(201).json({
            message: 'User added successfully',
        })
    } catch (error) {
        console.error('Add user error:', error)

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            })
        }

        return res.status(500).json({
            message: 'Unable to create account. Please try again'
        })
    }
}

exports.updateUser = async (req, res) => {

    try {
        const { firstName, lastName, email, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (firstName !== undefined) {
            if (typeof firstName !== 'string' || !firstName.trim()) {
                return res.status(400).json({ message: 'First Name is required' })
            }
            user.firstName = firstName.trim()
        }

        if (lastName !== undefined) {
            if (typeof lastName !== 'string' || !lastName.trim()) {
                return res.status(400).json({ message: 'Last Name is required' })
            }
            user.lastName = lastName.trim()
        }

        if (email !== undefined) {
            if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                return res.status(400).json({ message: 'Please enter a valid email' })
            }

            const normalizedEmail = email.trim().toLowerCase()
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: user._id }
            })

            if (existingUser) {
                return res.status(409).json({
                    message: 'An account with this email already exists'
                })
            }

            user.email = normalizedEmail
        }

        if (role !== undefined) {
            const normalizedRole = String(role).toLowerCase()
            if (!['admin', 'instructor', 'student'].includes(normalizedRole)) {
                return res.status(400).json({ message: 'Invalid role' })
            }
            user.role = normalizedRole
        }

        await user.save()

        res.status(200).json({
            message: 'User updated successfully'
        })
    } catch (error) {
        console.error('Update user error: ', error)
        res.status(500).json({ message: 'Failed to update user' })
    }
}

exports.deleteUser = async (req, res) => {

    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'User ID is missing'
            })
        }

        const user = await User.findById(id)

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        if (
            req.user &&
            req.user.id &&
            String(user._id) === String(req.user.id)
        ) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            })
        }

        await User.findByIdAndDelete(id)

        res.status(200).json({ message: 'User deleted successfully' })

    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({ message: 'Failed to delete user' })
    }
}