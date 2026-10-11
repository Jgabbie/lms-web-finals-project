const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const Instructor = require('../models/Instructor')
const User = require('../models/User')
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
            role
        } = req.body;

        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedDepartment = String(department).trim()
        const normalizedSpecialization = String(specialization).trim()

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

        if (normalizedDepartment.length < 2) {
            return res.status(400).json({
                message: 'Department must be at least 2 characters long'
            })
        }

        if (normalizedDepartment.length > 100) {
            return res.status(400).json({
                message: 'Department must not exceed 100 characters'
            })
        }

        if (normalizedSpecialization.length < 2) {
            return res.status(400).json({
                message: 'Specialization must be at least 2 characters long'
            })
        }

        if (normalizedSpecialization.length > 100) {
            return res.status(400).json({
                message: 'Specialization must not exceed 100 characters'
            })
        }

        const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() })
        if (existingInstructor) {
            return res.status(400).json({
                message: 'An instructor with this email already exists'
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

        const temporaryPassword = crypto.randomBytes(6).toString('base64url')

        const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

        await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            status: status || 'active',
            role: role || 'instructor',
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
                        <p style=""margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
        })

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

        await instructor.save()

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
            firstName,
            lastName,
            email,
            department,
            specialization,
        } = req.body

        const instructor = await Instructor.findById(req.params.id)
        if (!instructor) {
            return res.status(404).json({ message: 'Instructor not found' })
        }

        const normalizedFirstName = String(firstName).trim()
        const normalizedLastName = String(lastName).trim()
        const normalizedEmail = String(email).trim().toLowerCase()
        const normalizedDepartment = String(department).trim()
        const normalizedSpecialization = String(specialization).trim()

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

        if (normalizedDepartment.length < 2) {
            return res.status(400).json({
                message: 'Department must be at least 2 characters long'
            })
        }

        if (normalizedDepartment.length > 100) {
            return res.status(400).json({
                message: 'Department must not exceed 100 characters'
            })
        }

        if (normalizedSpecialization.length < 2) {
            return res.status(400).json({
                message: 'Specialization must be at least 2 characters long'
            })
        }

        if (normalizedSpecialization.length > 100) {
            return res.status(400).json({
                message: 'Specialization must not exceed 100 characters'
            })
        }

        const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() })
        if (existingInstructor) {
            return res.status(400).json({
                message: 'An instructor with this email already exists'
            })
        }

        await User.findByIdAndUpdate(req.params.id, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
        })

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
                                <strong>${role}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Department:
                                <strong>${normalizedDepartment}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Specialization:
                                <strong>${normalizedSpecialization}</strong>
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
                        <p style=""margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
        })

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
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'Instructor ID is required'
            })
        }

        const instructorInformation = await User.findByIdAndDelete(id)

        if (!instructorInformation) {
            return res.status(404).json({ message: 'Instructor not found' })
        }

        if (
            req.user &&
            req.user.id &&
            String(instructorInformation._id) === String(req.user.id)
        ) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            })
        }

        await ArchivedInstructor.findOneAndUpdate(
            { _id: instructorInformation._id },
            {
                _id: instructorInformation._id,
                firstName: instructorInformation.firstName,
                lastName: instructorInformation.lastName,
                password: instructorInformation.password,
                department: instructorInformation.department,
                specialization: instructorInformation.specialization,
                status: instructorInformation.status,
                email: instructorInformation.email,
                role: instructorInformation.role
            },
            { upsert: true, new: true, runValidators: true }
        );

        await ArchivedUser.findOneAndUpdate(
            { _id: instructorInformation._id },
            {
                _id: instructorInformation._id,
                firstName: instructorInformation.firstName,
                lastName: instructorInformation.lastName,
                password: instructorInformation.password,
                status: instructorInformation.status,
                email: instructorInformation.email,
                role: instructorInformation.role
            },
            { upsert: true, new: true, runValidators: true }
        );

        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: normalizedEmail,
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

                    <p>Hello ${normalizedFirstName} ${normalizedLastName},</p>

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
                                <strong>${normalizedEmail}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${role}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Department:
                                <strong>${normalizedDepartment}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Specialization:
                                <strong>${normalizedSpecialization}</strong>
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
                        <p style=""margin: 0; font-size: 12px; color: #6b7280;">
                        This is an automated message. Please do not reply to this email. If you have any questions or concerns, please contact our support team.
                        </p>
                    </div>
                </div>
            `
        })

        await Instructor.findByIdAndDelete(id)
        await User.findByIdAndDelete(id)

        res.status(200).json({ message: 'Instructor deleted successfully' })
    } catch (error) {
        console.error('Delete instructor error: ', error)
        res.status(500).json({ message: 'Failed to delete instructor' })
    }
}

exports.getArchivedInstructors = async (req, res) => {
    try {
        const instructors = await ArchivedInstructor.find({})
        res.status(200).json(instructors)
    } catch (error) {
        console.error('Retrieve archived instructors error: ', error)
        res.status(500).json({ message: 'Failed to retrieve archived instructors' })
    }
}

exports.restoreInstructor = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'Instructor ID is required'
            })
        }

        const archivedUser = await ArchivedUser.findById(id)
        const archivedInstructor = await ArchivedInstructor.findById(id)

        if (!archivedUser) {
            return res.status(404).json({ message: 'Archived user not found' })
        }

        const existingInstructor = await User.findOne({
            $or: [
                { email: archivedUser.email },
                { _id: archivedUser._id }
            ]
        })

        if (existingInstructor) {
            return res.status(400).json({
                message: 'An instructor with this email already exists'
            })
        }

        const restoredInstructor = new User({
            _id: archivedInstructor._id,
            firstName: archivedInstructor.firstName,
            lastName: archivedInstructor.lastName,
            email: archivedInstructor.email,
            role: archivedInstructor.role,
            status: 'active'
        })


        const restoredInstructorInInstructor = new Instructor({
            _id: archivedInstructor._id,
            instructorId: archivedInstructor.instructorId,
            firstName: archivedInstructor.firstName,
            lastName: archivedInstructor.lastName,
            email: archivedInstructor.email,
            specialization: archivedInstructor.specialization,
            department: archivedInstructor.department,
            status: 'active',
            role: 'instructor',
        })


        await restoredInstructor.save()
        await restoredInstructorInInstructor.save()

        await ArchivedInstructor.findByIdAndDelete(id)
        await ArchivedUser.findByIdAndDelete(id)

        res.status(200).json({ message: 'Instructor restored successfully' })
    } catch (error) {
        console.error('Restore instructor error: ', error)
        res.status(500).json({ message: 'Failed to restore instructor' })
    }
}
