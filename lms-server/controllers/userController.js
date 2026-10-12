const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const Instructor = require('../models/Instructor')
const Student = require('../models/Student')
const ArchivedStudent = require('../models/ArchivedStudent')
const ArchivedInstructor = require('../models/ArchivedInstructor')
const ArchivedUser = require('../models/ArchivedUser')

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

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

        if (normalizedRole === 'instructor') {
            const lastInstructor = await Instructor.findOne().sort({ instructorId: -1 })

            let nextIdNumber = 1

            if (lastInstructor && lastInstructor.instructorId) {
                const lastIdNumber = parseInt(lastInstructor.instructorId.replace('INST', ''))
                nextIdNumber = lastIdNumber + 1
            }

            const instructorId = `INST${nextIdNumber.toString().padStart(3, '0')}`
            await Instructor.create({
                instructorId: instructorId,
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
                password: hashedPassword,
                department: 'None',
                specialization: 'None',
                status: 'active',
            })

            await User.create({
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
                password: hashedPassword,
                role: normalizedRole
            })

            await transporter.sendMail({
                from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
                to: normalizedEmail,
                subject: 'EduLearn LMS - Account Created',
                html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${normalizedFirstName} ${normalizedLastName},</p>

                    <p>
                        Your account has been created successfully.
                        Here is your temporary password.
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            ${generatedPassword}
                        </span>
                    </div>

                    <p>
                        Please use this temporary password to log in and change your password immediately.
                    </p>

                    <p>
                        If you did not request a account creation for an EduLearn LMS
                        account, you can safely ignore this email.
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
            }).catch((error) => {
                res.status(500).json({ message: 'Failed to send email notification' + error })
                console.error('Error sending email:', error)
            })

            return res.status(201).json({
                message: 'User added successfully',
            })
        }

        if (normalizedRole === 'student') {
            await Student.create({
                studentId: 'None',
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
                password: hashedPassword,
                course: 'None',
                yearLevel: 'None',
                status: 'active',
            })

            await User.create({
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
                password: hashedPassword,
                role: normalizedRole
            })

            await transporter.sendMail({
                from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
                to: normalizedEmail,
                subject: 'EduLearn LMS - Account Created',
                html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${normalizedFirstName} ${normalizedLastName},</p>

                    <p>
                        Your account has been created successfully.
                        Here is your temporary password.
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            ${generatedPassword}
                        </span>
                    </div>

                    <p>
                        Please use this temporary password to log in and change your password immediately.
                    </p>

                    <p>
                        If you did not request a account creation for an EduLearn LMS
                        account, you can safely ignore this email.
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
            }).catch((error) => {
                console.error('Error sending account creation email:', error)
                throw new Error('Failed to send email notification')
            })

            return res.status(201).json({
                message: 'User added successfully',
            })
        }

    } catch (error) {
        console.error('Add user error:', error)

        return res.status(500).json({
            message: error.message || 'Unable to create account.',
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

        await Student.findByIdAndUpdate(user._id, {
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            role: normalizedRole
        }).exec()

        await Instructor.findByIdAndUpdate(user._id, {
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            role: normalizedRole
        }).exec()

        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: normalizedEmail,
            subject: 'EduLearn LMS - Account Updated',
            html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${normalizedFirstName} ${normalizedLastName},</p>

                    <p>
                        Your account has been updated successfully.
                        Your account details are now associated with the following information:
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Email Address:
                                <strong>${normalizedEmail}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${normalizedRole}</strong>
                            </p>
                        </span>
                    </div>

                    <p>
                        If you did not request this change, please contact support.
                    </p>

                    <p>
                        Thank you for using <strong>EduLearn LMS</strong>!
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
        })

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

        const userInformation = await User.findById(id)

        if (!userInformation) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (
            req.user &&
            req.user.id &&
            String(userInformation._id) === String(req.user.id)
        ) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            })
        }

        await ArchivedUser.findOneAndUpdate(
            { _id: userInformation._id },
            {
                _id: userInformation._id,
                firstName: userInformation.firstName,
                lastName: userInformation.lastName,
                password: userInformation.password,
                email: userInformation.email,
                role: userInformation.role
            },
            { upsert: true, new: true, runValidators: true }
        )

        if (userInformation.role === 'student') {
            const student = await Student.findOne({
                email: userInformation.email
            })

            if (student) {
                const archivedStudentId =
                    student.studentId && student.studentId !== 'None'
                        ? student.studentId
                        : `STU-${student._id}`

                await ArchivedStudent.findOneAndUpdate(
                    { _id: student._id },
                    {
                        _id: student._id,
                        studentId: archivedStudentId,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        password: student.password,
                        course: student.course,
                        yearLevel: student.yearLevel,
                        status: 'inactive'
                    },
                    { upsert: true, new: true, runValidators: true }
                )

                await Student.findOneAndDelete({
                    email: userInformation.email
                })

                await User.findByIdAndDelete(id)

                await transporter.sendMail({
                    from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
                    to: userInformation.email,
                    subject: 'EduLearn LMS - Account Deleted',
                    html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${userInformation.firstName} ${userInformation.lastName},</p>

                    <p>
                        Your account has been deleted successfully.
                        Your account details are no longer associated with the following information:
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Email Address:
                                <strong>${userInformation.email}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${userInformation.role}</strong>
                            </p>
                        </span>
                    </div>

                    <p>
                        If you did not request this change, please contact support.
                    </p>

                    <p>
                        Thank you for using <strong>EduLearn LMS</strong>!
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
                }).catch((error) => {
                    res.status(500).json({ message: 'Failed to send email notification' + error })
                    console.error('Error sending email:', error)
                })

                res.status(200).json({ message: 'User deleted successfully' })
            }
        }

        if (userInformation.role === 'instructor') {
            const instructor = await Instructor.findOne({
                email: userInformation.email
            })

            if (instructor) {
                await ArchivedInstructor.findOneAndUpdate(
                    { _id: instructor._id },
                    {
                        _id: instructor._id,
                        firstName: instructor.firstName,
                        lastName: instructor.lastName,
                        email: instructor.email,
                        password: instructor.password,
                        course: instructor.course,
                        yearLevel: instructor.yearLevel,
                        status: 'inactive'
                    },
                    { upsert: true, new: true, runValidators: true }
                )

                await Instructor.findOneAndDelete({
                    email: userInformation.email
                })

                await User.findByIdAndDelete(id)

                await transporter.sendMail({
                    from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
                    to: userInformation.email,
                    subject: 'EduLearn LMS - Account Deleted',
                    html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${userInformation.firstName} ${userInformation.lastName},</p>

                    <p>
                        Your account has been deleted successfully.
                        Your account details are no longer associated with the following information:
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Email Address:
                                <strong>${userInformation.email}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${userInformation.role}</strong>
                            </p>
                        </span>
                    </div>

                    <p>
                        If you did not request this change, please contact support.
                    </p>

                    <p>
                        Thank you for using <strong>EduLearn LMS</strong>!
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
                }).catch((error) => {
                    res.status(500).json({ message: 'Failed to send email notification' + error })
                    console.error('Error sending email:', error)
                })

                res.status(200).json({ message: 'User deleted successfully' })

            }
        }

        await User.findByIdAndDelete(id)

        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: userInformation.email,
            subject: 'EduLearn LMS - Account Deleted',
            html: `
                <div
                    style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    "
                >
                    <h2 style="color: #2563eb;">
                        EduLearn LMS
                    </h2>

                    <p>Hello ${userInformation.firstName} ${userInformation.lastName},</p>

                    <p>
                        Your account has been deleted successfully.
                        Your account details are no longer associated with the following information:
                    </p>

                    <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    ">
                        <span style="
                            display: inline-block;
                            background: #eff6ff;
                            color: #2563eb;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            padding: 15px 25px;
                            border-radius: 10px;
                        ">
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Email Address:
                                <strong>${userInformation.email}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${userInformation.role}</strong>
                            </p>
                        </span>
                    </div>

                    <p>
                        If you did not request this change, please contact support.
                    </p>

                    <p>
                        Thank you for using <strong>EduLearn LMS</strong>!
                    </p>

                    <div style="
                        background: #f3f4f6;
                        border-top: 1px solid #e5e7eb;
                        padding: 20px;
                        text-align: center;
                    "
                    >
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                            &copy; ${new Date().getFullYear()} EduLearn LMS. All rights reserved.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
        }).catch((error) => {
            console.error('Error sending email:', error)
        })

        res.status(200).json({ message: 'User deleted successfully' })

    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({ message: 'Failed to delete user' + error })
    }
}

exports.getArchivedUsers = async (req, res) => {
    try {
        const users = await ArchivedUser.find({})
        res.status(200).json(users)
    } catch (error) {
        console.error('Retrieve archived users error:', error)
        res.status(500).json({ message: 'Failed to retrieve archived users' })
    }
}

exports.restoreUser = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'User ID is missing'
            })
        }

        const archivedUser = await ArchivedUser.findById(id)

        if (!archivedUser) {
            return res.status(404).json({ message: 'Archived user not found' })
        }

        const existingUser = await User.findOne({
            $or: [
                { email: archivedUser.email },
                { _id: archivedUser._id }
            ]
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'A user with this email or ID already exists'
            })
        }

        const restoredUser = await User.create({
            _id: archivedUser._id,
            firstName: archivedUser.firstName,
            lastName: archivedUser.lastName,
            email: archivedUser.email,
            password: archivedUser.password,
            role: archivedUser.role
        })

        if (archivedUser.role === 'student') {
            const archivedStudent = await ArchivedStudent.findById(id)

            if (archivedStudent) {
                await Student.create({
                    _id: archivedStudent._id,
                    firstName: archivedStudent.firstName,
                    lastName: archivedStudent.lastName,
                    email: archivedStudent.email,
                    password: archivedStudent.password,
                    course: archivedStudent.course,
                    yearLevel: archivedStudent.yearLevel,
                    status: 'active'
                })
                await ArchivedStudent.findByIdAndDelete(id)
            }
        }

        if (archivedUser.role === 'instructor') {
            const archivedInstructor = await ArchivedInstructor.findById(id)
            if (archivedInstructor) {
                await Instructor.create({
                    _id: archivedInstructor._id,
                    firstName: archivedInstructor.firstName,
                    lastName: archivedInstructor.lastName,
                    email: archivedInstructor.email,
                    password: archivedInstructor.password,
                    department: archivedInstructor.department,
                    specialization: archivedInstructor.specialization,
                    status: 'active'
                })
                await ArchivedInstructor.findByIdAndDelete(id)
            }
        }

        await ArchivedUser.findByIdAndDelete(id)

        res.status(200).json({
            message: 'User restored successfully',
            user: restoredUser
        })
    } catch (error) {
        console.error('Restore user error:', error)
        res.status(500).json({ message: 'Failed to restore user' })
    }
}