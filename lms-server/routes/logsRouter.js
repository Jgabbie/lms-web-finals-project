const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const User = require('../models/User')

const pendingPasswordResets = new Map()

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES)

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
})

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}


router.post('/change-password/send-otp', async (req, res) => {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address'
            })
        }

        const user = await User.findOne({
            email: normalizedEmail
        })

        if (!user) {
            return res.status(404).json({
                message: 'No account was found with this email address'
            })
        }

        const otp = generateOTP()

        const expiresAt = Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000

        pendingPasswordResets.set(normalizedEmail, {
            otp,
            expiresAt,
            attempts: 0
        })


        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: normalizedEmail,
            subject: 'EduLearn LMS - Password Reset OTP',
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

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your EduLearn LMS password.
                    </p>

                    <p>
                        Use the verification code below:
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
                            ${otp}
                        </span>
                    </div>

                    <p>
                        This OTP will expire in
                        <strong>${OTP_EXPIRE_MINUTES}</strong>
                    </p>

                    <p>
                        If ypu did not attempt to create an EduLearn LMS
                        account, you can safely ignore this email.
                    </p>
                </div>
            `
        })

        return res.json({
            message: `A verification code has been sent to ${normalizedEmail}.`,
            email: normalizedEmail
        })


    } catch (error) {
        console.error('Send password reset OTP error: ', error)

        return res.status(500).json({
            message: 'Unable to resend verification code. Please try again'
        })
    }
})


router.post('/change-password/verify-otp', async (req, res) => {
    try {
        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const resetData = pendingPasswordResets.get(normalizedEmail)

        if (!resetData) {
            return res.status(400).json({
                message: 'Password reset session not found. Please request a new OTP.'
            })
        }

        if (Date.now() > resetData.expiresAt) {
            pendingPasswordResets.delete(normalizedEmail)

            return res.status(400).json({
                message: 'OTP has expired. Please request a new verification code.'
            })
        }


        if (resetData.attempts >= 5) {
            pendingPasswordResets.delete(normalizedEmail)

            return res.status(429).json({
                message: 'Too many incorrect attempts. Please request a new OTP'
            })
        }


        if (resetData.otp !== otp.trim()) {
            resetData.attempts += 1

            return res.status(400).json({
                message: 'Invalid verification code'
            })
        }

        resetData.verified = true

        return res.status(201).json({
            message: 'OTP verified successfully. You may now reset you password.',
            email: normalizedEmail,
        })


    } catch (error) {
        console.error('Verify password reset OTP error:: ', error)

        return res.status(500).json({
            message: 'Unable to verify OTP. Please try again.'
        })
    }
})


router.post('/change-password/reset', async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword
        } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const resetData = pendingPasswordResets.get(normalizedEmail)

        if (!resetData) {
            return res.status(400).json({
                message: 'Password reset session not found. Please request a new OTP.'
            })
        }

        if (!resetData.verified) {
            return res.status(400).json({
                message: 'Please verify the OTP before resetting your password.'
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                messgae: 'Password must be at least 8 characters'
            })
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9\s]/.test(password)
        ) {
            return res.status(400).json({
                message: 'Password must include an uppercase, lowercase, a number, and a special character'
            })
        }

        const user = await User.findOne({
            email: normalizedEmail
        })

        if (!user) {
            pendingPasswordResets.delete(normalizedEmail)

            return res.status(404).json({
                message: 'User account was not found'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        user.password = hashedPassword

        await user.save()

        pendingPasswordResets.delete(normalizedEmail)

        return res.status(200).json({
            message: 'Password reset successfully. You can now log in'
        })

    } catch (error) {
        console.error('Reset password error: ', error)

        return res.status(500).json({
            message: 'Unable to reset password. Please try again.'
        })
    }
})


router.post('/change-password/resend-otp', async (req, res) => {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required'
            })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const user = await User.findOne({
            email: normalizedEmail
        })

        if (!user) {
            return res.status(404).json({
                message: 'No account was found with this email address'
            })
        }

        const resetData = pendingPasswordResets.get(normalizedEmail)

        if (!resetData) {
            return res.status(400).json({
                message: 'Password reset session not found. Please request a new OTP.'
            })
        }

        const otp = generateOTP()

        resetData.otp = otp
        resetData.expiresAt = Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000
        resetData.attempts = 0
        resetData.verified = false


        await transporter.sendMail({
            from: `"EduLearn LMS" <${process.env.EMAIL_FROM}>`,
            to: normalizedEmail,
            subject: 'EduLearn LMS - Password Reset OTP',
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

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your EduLearn LMS password.
                    </p>

                    <p>
                        Use the verification code below:
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
                            ${otp}
                        </span>
                    </div>

                    <p>
                        This OTP will expire in
                        <strong>${OTP_EXPIRE_MINUTES}</strong>
                    </p>

                    <p>
                        If ypu did not attempt to create an EduLearn LMS
                        account, you can safely ignore this email.
                    </p>
                </div>
            `
        })

        return res.status(200).json({
            message: 'A new verification code has been sent.'
        })


    } catch (error) {
        console.error('Resent password reset OTP error ', error)

        return res.status(500).json({
            message: 'Unable to resend verification code. Please try again'
        })
    }
})


module.exports = router;