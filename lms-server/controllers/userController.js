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

        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedRole = String(role).toLowerCase()

        const namePattern = /^[\p{L}]+(?:['\u{2019}]?[\p{L}]+)*$/u

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

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        const allowedRoles = ['admin', 'instructor', 'student']

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
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
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
        const {
            firstName,
            lastName,
            email,
            role
        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedRole = String(role).toLowerCase()

        const namePattern = /^[\p{L}]+(?:['\u{2019}]?[\p{L}]+)*$/u

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

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        const allowedRoles = ['admin', 'instructor', 'student']

        if (!allowedRoles.includes(normalizedRole)) {
            return res.status(400).json({ message: 'Invalid role' })
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id }
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            })
        }

        user.firstName = normalizedFirstName
        user.lastName = normalizedLastName
        user.email = normalizedEmail
        user.role = normalizedRole

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