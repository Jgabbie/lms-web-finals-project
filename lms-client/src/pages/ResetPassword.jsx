import { TextField, Button, Typography, Link, Snackbar, Alert, Box, Modal, InputAdornment, IconButton } from '@mui/material'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { useState } from 'react'
import axios from 'axios'
import ResetPasswordGraphic from "../assets/graphics/undraw_secure-password_9qv4.svg"

//test

export default function ResetPassword() {

    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [showOtpModal, setShowOtpModal] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)

    const [emailError, setEmailError] = useState('')
    const [otpError, setOtpError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')


    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success"
    })


    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity
        })
    }

    const closeNotification = () => {
        setNotification((prev => ({
            ...prev,
            open: false
        })))
    }


    const validateEmail = () => {
        const cleanEmail = email.trim().toLowerCase()

        console.log(cleanEmail)

        if (!cleanEmail) {
            setEmailError('Email address is required')
            return false
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setEmailError('Please enter a valid email address')
            return false
        }

        setEmailError('')
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateEmail()) return
        try {
            setLoading(true)

            const response = await axios.post('http://localhost:5000/api/auth/forgot-password/send-otp',
                {
                    email: email.trim().toLowerCase(),
                }
            )

            showNotification(
                response.data.message ||
                "Verification code sent to your email",
                "success"
            )

            setOtp('')
            setOtpError('')
            setShowOtpModal(true)

        } catch (error) {
            showNotification(
                error.response?.data?.message ||
                "Unable to send verification code",
                "error"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError('Please enter the verification code')
            return
        }

        if (!/^\d{6}$/.test(otp.trim())) {
            setOtpError('OTP must be a 6-digit number')
            return
        }

        try {
            setOtpLoading(true)
            setOtpError('')

            const response = await axios.post('http://localhost:5000/api/auth/forgot-password/verify-otp',
                {
                    email: email.trim().toLowerCase(),
                    otp: otp.trim()
                }
            )

            showNotification(
                response.data.message ||
                'OTP verified successfully.',
                'success'
            )

            setShowOtpModal(false)
            setShowResetModal(true)

        } catch (error) {
            setOtpError(
                error.response?.data?.message ||
                'Invalid verification code'
            )
        } finally {
            setOtpLoading(false)
        }
    }


    const handleResendOtp = async () => {
        try {
            setResendLoading(true)
            setOtpError('')

            const response = await axios.post('http://localhost:5000/api/auth/forgot-password/resend-otp',
                {
                    email: email.trim().toLowerCase(),
                }
            )

            setOtp('')

            showNotification(
                response.data.message || 'A new verification code has been sent.',
                'success'
            )

        } catch (error) {
            setOtpError(
                error.response?.data?.message ||
                'Unable to resend OTP'
            )
        } finally {
            setOtpLoading(false)
        }
    }


    const validatePassword = () => {
        if (!password) {
            setPasswordError(
                'Password is required'
            )
            return false
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            return false
        }

        if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9\s]/.test(password)
        ) {
            setPasswordError('Password must include an uppercase, lowercase, a number, and a special character')
            return false
        }

        setPasswordError('')
        return true
    }


    const handleResetPassword = async () => {
        let valid = true

        if (!validatePassword()) {
            valid = false
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password')
            valid = false
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match')
            valid = false
        } else {
            setConfirmPasswordError('')
        }

        if (!valid) return

        try {
            setLoading(true)

            const response = await axios.post('http://localhost:5000/api/auth/forgot-password/reset',
                {
                    email: email.trim().toLowerCase(),
                    password,
                    confirmPassword
                }
            )

            setShowResetModal(false)

            showNotification(
                response.data.message ||
                'Password reset successfully.',
                'success'
            )

            setEmail('')
            setOtp('')
            setPassword('')
            setConfirmPassword('')

        } catch (error) {
            showNotification(
                error.response?.data?.message ||
                'Password reset successfully.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <div className=' relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10'>

                <div className='absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/60 ' />
                <div className='absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/60 ' />
                <div className='absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-blue-200/60 ' />

                <div className='relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16'>
                    {/* left */}
                    <div className='w-full lg:w-1/2 flex items-center justify-center'>
                        <div className='w-full max-w-lg'>
                            <Box
                                component="img"
                                src={ResetPasswordGraphic}
                                alt='Reset Password Graphics'
                                className='w-full max-w-lg h-auto object-contain'
                            />
                        </div>
                    </div>


                    {/* right */}
                    <div className='w-full lg:w-1/2 flex items-center justify-center'>
                        <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10'>

                            <div className='text-center mb-8'>
                                <Typography variant='h5' className='font-bold text-slate-800'>
                                    Forgot Password?
                                </Typography>
                                <Typography variant='body2' className='text-slate-500 mt-2'>
                                    Please enter your email so we can send you a One-Time-Pin (OTP) for reseting your password.
                                </Typography>
                            </div>

                            <form className='flex flex-col gap-5' onSubmit={handleSubmit}>
                                <TextField
                                    label="Email Address"
                                    type='email'
                                    variant='outlined'
                                    fullWidth
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setEmailError('')
                                    }}
                                    error={Boolean(emailError)}
                                    helperText={emailError}
                                    autoComplete='email'
                                />

                                <Button
                                    type='submit'
                                    variant='contained'
                                    size='large'
                                    disabled={loading}
                                    className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-2 text-base font-medium'
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>
                            </form>

                            <div className='mt-8 text-center'>
                                <Typography variant='body2' className='text-slate-600'>
                                    Remembered your password?

                                    <Link href="/login" underline='hover' className='!ml-4 text-blue-600 font-bold cursor-pointer'>
                                        Login here
                                    </Link>
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={showOtpModal}
                onClose={() => {
                    if (!otpLoading) {
                        setShowOtpModal(false)
                    }
                }}
                className='flex items-center justify-center p-4'
            >
                <div className='relative max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
                    <div className='text-center'>

                        <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100'>
                            <span className='text-2xl'>
                                EduLearn
                            </span>
                        </div>
                        <Typography variant='h5' className='font-bold text-slate-800'>
                            Verify Your Email
                        </Typography>
                        <Typography variant='body2' className='text-slate-500 mt-2'>
                            We sent a 6-digits verification code to
                        </Typography>
                        <Typography variant='body2' className='font-bold text-blue-600 mt-1 break-all'>
                            {email}
                        </Typography>
                    </div>

                    <div className='mt-6'>
                        <TextField
                            label="Verification Code"
                            placeholder='Enter 6-digit OTP'
                            fullWidth
                            value={otp}
                            onChange={(e) => {
                                const value = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6)

                                setOtp(value)
                                setOtpError('')
                            }}
                            error={Boolean(otpError)}
                            helperText={
                                otpError ||
                                'The code will expire in 5 minutes'
                            }
                            inputProps={{
                                maxLength: 6,
                                inputMode: 'numeric'
                            }}
                        />
                    </div>

                    <Button
                        fullWidth
                        variant='contained'
                        size='large'
                        disabled={
                            otpLoading ||
                            otp.length !== 6
                        }
                        onClick={handleVerifyOtp}
                        className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-5'
                    >
                        {otpLoading
                            ? 'Verifying...'
                            : 'Verify & Create Account'
                        }
                    </Button>

                    <div className='text-center mt-5'>
                        <Typography variant='body2' className='text-slate-500'>
                            Didn't receive the code?
                        </Typography>

                        <Button
                            variant='text'
                            disabled={resendLoading}
                            onClick={handleResendOtp}
                            className='text-blue-600 normal-case font-bold'
                        >
                            {resendLoading
                                ? 'Sending...'
                                : 'Resend OTP'
                            }
                        </Button>
                    </div>

                    <div className='text-center mt-2'>
                        <Button
                            variant='text'
                            disabled={otpLoading}
                            onClick={() => {
                                setShowOtpModal(false)
                                setOtp('')
                                setOtpError('')
                            }}
                            className='text-slate-500 normal-case'
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>


            <Modal
                open={showResetModal}
                onClose={() => {
                    if (!loading) {
                        setShowResetModal(false)
                    }
                }}
                className='flex items-center justify-center p-4'
            >
                <div className='relative max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
                    <div className='text-center mb-6'>

                        <Typography variant='h5' className='font-bold text-slate-800'>
                            Create New Password
                        </Typography>
                        <Typography variant='body2' className='text-slate-500 mt-2'>
                            Enter your new password below
                        </Typography>
                    </div>

                    <div className='flex flex-col gap-5'>
                        <TextField
                            label="New Password"
                            type={
                                showPassword ? "text" : "password"
                            }
                            fullWidth
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setPasswordError('')
                            }}
                            error={Boolean(passwordError)}
                            helperText={passwordError}
                            autoComplete='new-password'
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(!showPassword)
                                                }
                                                edge='end'
                                            >
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />


                        <TextField
                            label="Confirm New Password"
                            type={
                                showConfirmPassword ? "text" : "password"
                            }
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setConfirmPasswordError('')
                            }}
                            error={Boolean(confirmPasswordError)}
                            helperText={confirmPasswordError}
                            autoComplete='new-password'
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                edge='end'
                                            >
                                                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <Button
                            fullWidth
                            variant='contained'
                            size='large'
                            disabled={loading}
                            onClick={handleResetPassword}
                            className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-5'
                        >
                            {loading
                                ? 'Resetting Password...'
                                : 'Reset Password'
                            }
                        </Button>
                    </div>
                </div>
            </Modal>


            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={closeNotification}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
            >
                <Alert
                    onClose={closeNotification}
                    severity={notification.severity}
                    variant='filled'
                    sx={{ width: "100%" }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    )
}
