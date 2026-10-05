import { TextField, Button, Checkbox, FormControlLabel, Typography, Link, InputAdornment, IconButton, Modal, Snackbar, Alert } from '@mui/material'
import { VisibilityOff, Visibility } from '@mui/icons-material'
import { useState } from 'react'
import axios from 'axios'


export default function SignupPage() {

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showTermsAndConds, setShowTermsAndConds] = useState(false)
    const [termsAndCondsAccepted, setTermsAndCondsAccepted] = useState(false)

    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState('')

    const [otpLoading, setOtpLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [errors, setErrors] = useState('')
    const [loading, setLoading] = useState('')


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

    const updateField = (field, setter, value) => {
        setter(value)
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }))
    }

    const validateForm = () => {
        const newErrors = {}

        const trimmedFirstName = firstName.trim()
        const trimmedLastName = lastName.trim()
        const trimmedEmail = email.trim()

        if (!trimmedFirstName) {
            newErrors.firstName = 'First name is required'
        } else if (trimmedFirstName.length < 2) {
            newErrors.firstName = 'First name must be atleast 2 characters'
        } else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(trimmedFirstName)) {
            newErrors.firstName = 'Enter a valid first name'
        }

        if (!trimmedLastName) {
            newErrors.lastName = 'Last name is required'
        } else if (trimmedLastName.length < 2) {
            newErrors.lastName = 'Last name must be atleast 2 characters'
        } else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(trimmedLastName)) {
            newErrors.lastName = 'Enter a valid last name'
        }

        if (!trimmedEmail) {
            newErrors.email = 'Email Address is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.lastName = 'Enter a valid last name'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        } else if (
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9\s]/.test(password)
        ) {
            newErrors.password = 'Password must include an uppercase, lowercase, a number, and a special character'
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (password !== confirmPassword) {
            newErrors.password = 'Passwords do not match'
        }

        if (!termsAndCondsAccepted) {
            newErrors.termsAndCondsAccepted = 'You must accept the Terms and Conditions'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0

    }


    //submit signup
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (loading || !validateForm()) return

        try {
            setLoading(true)

            const res = await axios.post('http://localhost:5000/api/auth/register/send-otp',
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim().toLowerCase(),
                    password,
                    termsAccepted: termsAndCondsAccepted
                });

            showNotification(
                res.data.message ||
                'Account created successfully, You can now log in', 'success'
            )

            setOtp('')
            setOtpError('')
            setShowOtpModal(true)

        } catch (error) {
            const message = error.response?.data?.message || 'Unable to send verification code. Please try again'
            showNotification(message, 'error')
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

            const response = await axios.post('http://localhost:5000/api/auth/register/verify-otp',
                {
                    email: email.trim().toLowerCase(),
                    otp: otp.trim()
                }
            )

            setShowOtpModal(false)

            showNotification(
                response.data.message || 'Account created successfully.',
                'success'
            )

            setFirstName('')
            setLastName('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setTermsAndCondsAccepted(false)
            setOtp('')

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
            setOtpLoading(true)
            setOtpError('')

            const response = await axios.post('http://localhost:5000/api/auth/register/resend-otp',
                {
                    email: email.trim().toLowerCase(),
                }
            )

            showNotification(
                response.data.message || 'A new verification code has been sent.',
                'success'
            )

            setOtp('')

        } catch (error) {
            setOtpError(
                error.response?.data?.message ||
                'Unable to resend OTP'
            )
        } finally {
            setOtpLoading(false)
        }
    }


    //open terms and conditions modal
    const openTermsAndCondsModal = () => {
        setShowTermsAndConds(true)
    }

    //close terms and conditions modal
    const closeTermsAndCondsModal = () => {
        setShowTermsAndConds(false)
    }

    //agree to terms and conds
    const agreeToTermsAndConds = () => {
        setTermsAndCondsAccepted(true)
        setShowTermsAndConds(false)
        showNotification("You have agreed with the Terms and Conditions of EduLearn", "success")
    }

    return (
        <>
            <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4'>

                <div className='absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/60 ' />
                <div className='absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/60 ' />
                <div className='absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-blue-200/60 ' />

                <div className='relative max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10'>
                    <div className='text-center mb-8'>
                        <Typography variant='h5' className='font-bold text-blue-600 tracking-wide mb-2'>
                            EduLearn LMS
                        </Typography>
                        <Typography variant='h5' className='font-bold text-slate-800'>
                            Welcome New User
                        </Typography>
                        <Typography variant='body2' className='text-slate-500 mt-2'>
                            Please enter required details to sign up.
                        </Typography>
                    </div>

                    <form className='flex flex-col gap-5' onSubmit={handleSubmit}>

                        {/* firstname and lastname */}
                        <div className='flex flex-row gap-3'>
                            <TextField
                                label="First Name"
                                type='text'
                                variant='outlined'
                                fullWidth
                                required
                                value={firstName}
                                onChange={e => updateField('firstName', setFirstName, e.target.value)}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                                autoComplete='given-name'
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 50
                                    }
                                }}
                            />
                            <TextField
                                label="Last Name"
                                type='text'
                                variant='outlined'
                                fullWidth
                                required
                                value={lastName}
                                onChange={e => updateField('lastName', setLastName, e.target.value)}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                                autoComplete='family-name'
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 50
                                    }
                                }}
                            />
                        </div>


                        {/* email address */}
                        <TextField
                            label="Email Address"
                            type='email'
                            variant='outlined'
                            fullWidth
                            required
                            value={email}
                            onChange={e => updateField('email', setEmail, e.target.value)}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            autoComplete='email'
                            slotProps={{
                                htmlInput: {
                                    maxLength: 254
                                }
                            }}
                        />


                        {/* if adding any type of customization like eye icons for password use "slotProps" */}
                        {/* if customizing styles of MUI components, use "sx" */}
                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            variant='outlined'
                            fullWidth
                            required
                            value={password}
                            onChange={e => updateField('password', setPassword, e.target.value)}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                            autoComplete='new-password'
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onClick={() => { setShowPassword(!showPassword) }} edge="end">
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                },
                                htmlInput: {
                                    maxLength: 72
                                }
                            }}
                        />

                        <TextField
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            variant='outlined'
                            fullWidth
                            required
                            value={confirmPassword}
                            onChange={e => updateField('confirmPassword', setConfirmPassword, e.target.value)}
                            error={Boolean(errors.confirmPassword)}
                            helperText={errors.confirmPassword}
                            autoComplete='new-password'
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => { setShowConfirmPassword(!showConfirmPassword) }} edge="end">
                                                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                },
                                htmlInput: {
                                    maxLength: 72
                                }
                            }}
                        />



                        <div className='flex items-center justify-between -mt-2'>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size='small'
                                        className='text-blue-600'
                                        checked={termsAndCondsAccepted}
                                        onChange={(e) => setTermsAndCondsAccepted(e.target.checked)}
                                    />}
                                label={
                                    <Typography variant='body2' className='text-slate-600'>Agree with the
                                        <Link
                                            component='button'
                                            type='button'
                                            onClick={openTermsAndCondsModal}
                                            underline='hover'
                                            className='!ml-1 text-blue-600 font-bold cursor-pointer'>
                                            Terms and Conditions
                                        </Link>
                                    </Typography>
                                }
                            />

                            {errors.termsAndCondsAccepted && (
                                <Typography variant='caption' color='error' className='ml-3'>
                                    {errors.termsAndCondsAccepted}
                                </Typography>
                            )}
                        </div>

                        <Button
                            type='submit'
                            variant='contained'
                            size='large'
                            disabled={loading}
                            className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-2 text-base font-medium'
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className='mt-8 text-center'>
                        <Typography variant='body2' className='text-slate-600'>
                            Already have an account?

                            <Link href="/login" underline='hover' className='!ml-4 text-blue-600 font-bold cursor-pointer'>
                                Login here
                            </Link>
                        </Typography>
                    </div>
                </div>
            </div>


            {/* terms and conditions modal */}
            <Modal
                open={showTermsAndConds}
                onClose={closeTermsAndCondsModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className='flex items-center justify-center p-4'
            >
                <div className='relative max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-2 sm:p-10'>
                    <div className='text-center'>
                        <Typography variant='h5' className='font-bold text-blue-600 tracking-wide mb-2'>
                            Welcome to EduLearn LMS
                        </Typography>
                        <Typography variant='h5' className='font-bold text-slate-800'>
                            Terms and Conditions
                        </Typography>
                        <Typography variant='caption' className='text-slate-500 mt-2'>
                            Kindly carefully read the terms and conditions
                        </Typography>

                        <div className='text-justify mt-4 '>
                            <div className='mb-4'>
                                <Typography variant='body2' className='text-slate-500 mt-2'>
                                    LOGGING IN AND SIGNING UP
                                </Typography>
                                <Typography variant='caption' className='text-slate-500 mt-2'>
                                    Kindly carefully read the terms and conditions
                                </Typography>
                            </div>

                            <div className='mb-4'>
                                <Typography variant='body2' className='text-slate-500 mt-2'>
                                    LOGGING IN AND SIGNING UP
                                </Typography>
                                <Typography variant='caption' className='text-slate-500 mt-2'>
                                    Kindly carefully read the terms and conditions
                                </Typography>
                            </div>

                            <div className='mb-4'>
                                <Typography variant='body2' className='text-slate-500 mt-2'>
                                    LOGGING IN AND SIGNING UP
                                </Typography>
                                <Typography variant='caption' className='text-slate-500 mt-2'>
                                    Kindly carefully read the terms and conditions
                                </Typography>
                            </div>
                        </div>

                        <div className='flex justify-end'>
                            <Button onClick={agreeToTermsAndConds} variant='contained' size='large' className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-2 text-base font-medium'>
                                I Agree
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>


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
                                E
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
                        disable={
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
