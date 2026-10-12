const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const Student = require('../models/Student')
const User = require('../models/User')
const Course = require('../models/Course')
const ArchivedStudent = require('../models/ArchivedStudent')
const ArchivedUser = require('../models/ArchivedUser')

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

const logActivity = async (user, action, description) => {
    const actor = req.user
    await Log.create({
        firstName: actor.firstName,
        lastName: actor.lastName,
        role: actor.role,
        action: action,
        description: description,
        status: 'Success'
    })
}

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

        const existingStudent = await Student.findOne({ email: email.toLowerCase() })
        if (existingStudent) {
            return res.status(400).json({
                message: 'A student with this email already exists'
            })
        }

        const selectedCourse = await Course.findOne({ name: normalizedCourse })
        if (!selectedCourse) {
            return res.status(400).json({
                message: 'The specified course does not exist'
            })
        }

        const generatedPassword = crypto.randomBytes(6).toString('base64url')

        const hashedPassword = await bcrypt.hash(generatedPassword, 10)

        await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            status: 'active',
            role: 'student',
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

        await logActivity(
            req,
            'Create',
            `Created student account for ${normalizedFirstName} ${normalizedLastName}`
        )

        const student = new Student({
            studentId: normalizedStudentId,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            password: hashedPassword,
            course: normalizedCourse,
            yearLevel: normalizedYearLevel,
            status: 'active',
            role: 'student',
        })

        await student.save()

        await Course.findByIdAndUpdate(selectedCourse._id, {
            $addToSet: { enrolledStudents: student._id }
        })

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

        const selectedCourse = await Course.findOne({ name: normalizedCourse })
        if (!selectedCourse) {
            return res.status(400).json({
                message: 'The specified course does not exist'
            })
        }

        const existingStudentId = await Student.findOne({ studentId: studentId.trim() })
        if (existingStudentId) {
            return res.status(400).json({
                message: 'A student with this Student Number already exists'
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
                                Account Course:
                                <strong>${normalizedCourse}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Year Level:
                                <strong>${normalizedYearLevel}</strong>
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

        const previousCourse = await Course.findOne({
            courseName: student.course
        })

        await User.findOneAndUpdate(
            { email: student.email },
            {
                firstName: normalizedFirstName,
                lastName: normalizedLastName,
                email: normalizedEmail,
            }
        )

        student.studentId = normalizedStudentId
        student.firstName = normalizedFirstName
        student.lastName = normalizedLastName
        student.email = normalizedEmail
        student.course = normalizedCourse
        student.yearLevel = normalizedYearLevel

        await student.save()

        if (previousCourse && previousCourse._id.toString() !== selectedCourse._id.toString()) {
            await Course.findByIdAndUpdate(previousCourse._id, {
                $pull: { enrolledStudents: student._id }
            })
        }

        await Course.findByIdAndUpdate(
            selectedCourse._id, {
            $addToSet: {
                enrolledStudents: student._id
            }
        })

        await logActivity(
            req,
            'Update',
            `Updated student account for ${normalizedFirstName} ${normalizedLastName}`
        )

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
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'Student ID is required'
            })
        }

        const studentInformation = await Student.findById(id)

        if (!studentInformation) {
            return res.status(404).json({ message: 'Student not found' })
        }

        if (
            req.user &&
            req.user.id &&
            String(studentInformation._id) === String(req.user.id)
        ) {
            return res.status(400).json({
                message: 'You cannot delete your own account'
            })
        }

        await ArchivedStudent.findOneAndUpdate(
            { _id: studentInformation._id },
            {
                _id: studentInformation._id,
                studentId: studentInformation.studentId,
                firstName: studentInformation.firstName,
                lastName: studentInformation.lastName,
                password: studentInformation.password,
                course: studentInformation.course,
                yearLevel: studentInformation.yearLevel,
                status: 'inactive',
                email: studentInformation.email,
                role: studentInformation.role
            },
            { upsert: true, new: true, runValidators: true }
        );

        await ArchivedUser.findOneAndUpdate(
            { _id: studentInformation._id },
            {
                _id: studentInformation._id,
                firstName: studentInformation.firstName,
                lastName: studentInformation.lastName,
                password: studentInformation.password,
                status: 'inactive',
                email: studentInformation.email,
                role: studentInformation.role
            },
            { upsert: true, new: true, runValidators: true }
        );

        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: studentInformation.email,
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

                    <p>Hello ${studentInformation.firstName} ${studentInformation.lastName},</p>

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
                                <strong>${studentInformation.email}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Role:
                                <strong>${studentInformation.role}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Course:
                                <strong>${studentInformation.course}</strong>
                            </p>
                            <p style="margin: 0 0 12px; font-size: 14px;">
                                Account Year Level:
                                <strong>${studentInformation.yearLevel}</strong>
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

        await Student.findByIdAndDelete(id)
        await User.findOneAndDelete({ email: studentInformation.email })

        await logActivity(
            req,
            'Delete',
            `Deleted student account for ${normalizedFirstName} ${normalizedLastName}`
        )

        res.status(200).json({ message: 'Student deleted successfully' })
    } catch (error) {
        console.error('Delete student error: ', error)
        res.status(500).json({ message: 'Failed to delete student' })
    }
}

exports.getArchivedStudents = async (req, res) => {
    try {
        const students = await ArchivedStudent.find({})
        res.status(200).json(students)
    } catch (error) {
        console.error('Retrieve archived students error: ', error)
        res.status(500).json({ message: 'Failed to retrieve archived students' })
    }
}

exports.restoreStudent = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({
                message: 'Student ID is required'
            })
        }

        const archivedStudent = await ArchivedStudent.findById(id)
        const archivedUser = await ArchivedUser.findOne({ email: archivedStudent.email })


        if (!archivedUser) {
            return res.status(404).json({ message: 'Archived student not found' })
        }

        const existingStudent = await User.findOne({
            $or: [
                { email: archivedUser.email },
                { _id: archivedUser._id }
            ]
        })

        if (existingStudent) {
            return res.status(400).json({
                message: 'A student with this email already exists'
            })
        }

        const restoredStudent = new User({
            _id: archivedUser._id,
            firstName: archivedUser.firstName,
            lastName: archivedUser.lastName,
            password: archivedUser.password,
            email: archivedUser.email,
            role: archivedUser.role,
            status: 'active'
        })

        const restoredStudentInStudent = new Student({
            _id: archivedStudent._id,
            studentId: archivedStudent.studentId || 'None',
            firstName: archivedStudent.firstName,
            lastName: archivedStudent.lastName,
            password: archivedStudent.password,
            email: archivedStudent.email,
            course: archivedStudent.course || 'None',
            yearLevel: archivedStudent.yearLevel || 'None',
            status: 'active',
            role: 'student'
        })


        await restoredStudent.save()
        await restoredStudentInStudent.save()

        await ArchivedStudent.findByIdAndDelete(id)
        await ArchivedUser.findOneAndDelete({ email: archivedStudent.email })

        await logActivity(
            req,
            'Restore',
            `Restored student account for ${normalizedFirstName} ${normalizedLastName}`
        )

        res.status(200).json({ message: 'Student restored successfully' })

    } catch (error) {
        console.error('Restore student error: ', error)
        res.status(500).json({ message: 'Failed to restore student' })
    }
}



