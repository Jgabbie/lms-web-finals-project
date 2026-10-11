import { TextField, Button, Checkbox, FormControlLabel, Typography, Link, InputAdornment, IconButton, Modal, Snackbar, Alert } from '@mui/material'
import { VisibilityOff, Visibility, School } from '@mui/icons-material'
import { useState } from 'react'
import api from '../api/axiosClient'
import './SignupPage.css'


export default function SignupPage() {

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showTermsAndConds, setShowTermsAndConds] = useState(false)
    const [termsAndCondsAccepted, setTermsAndCondsAccepted] = useState(false)

    const [showOtpModal, setShowOtpModal] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState('')

    const [otpLoading, setOtpLoading] = useState(false)
    const [resendLoading] = useState(false)

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [errors, setErrors] = useState('')
    const [loading, setLoading] = useState(false)


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
            newErrors.email = 'Enter a valid email address'
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
            newErrors.confirmPassword = 'Passwords do not match'
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

            const res = await api.post('/auth/register/send-otp',
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

            const response = await api.post('/auth/register/verify-otp',
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

            const response = await api.post('/auth/register/resend-otp',
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
            <main className='edusignup'>
                <aside className='signup-story'>
                    <div className='signup-art' aria-hidden='true'><span /><span /><span /></div>
                    <div>
                        <a className='signup-brand' href='/'>EduLearn.</a>
                        <p className='signup-eyebrow'>YOUR NEXT CHAPTER STARTS HERE</p>
                        <h2>A brighter future<br />starts with you.</h2>
                        <p className='signup-story-copy'>Build your skills, follow your curiosity, and make room for new possibilities.</p>
                    </div>
                    <div className='signup-story-bottom'>
                        <span>Stay curious.</span><span>Keep growing.</span><span>Learn at your pace.</span>
                        <p>Small steps. Endless possibilities.</p>
                    </div>
                </aside>
                <section className='signup-form-panel' aria-labelledby='signup-title'>
                    <div className='signup-heading'>
                        <Typography className='signup-form-brand'>EduLearn LMS</Typography>
                        <Typography component='h1' id='signup-title' className='signup-title'>Start your journey.</Typography>
                        <Typography className='signup-subtitle'>Create your account and take the first step toward something great.</Typography>
                    </div>
                    <div className='signup-progress'>
                        <div className='signup-step-labels'><span aria-current={showOtpModal ? undefined : 'step'}>01 Account details</span><span aria-current={showOtpModal ? 'step' : undefined}>02 Verify email</span></div>
                        <div className='signup-progress-track' role='progressbar' aria-label='Account creation step' aria-valuemin={0} aria-valuemax={2} aria-valuenow={showOtpModal ? 2 : 1} aria-valuetext={showOtpModal ? 'Step 2 of 2: Verify email' : 'Step 1 of 2: Account details'}><span style={{ width: showOtpModal ? '100%' : '50%' }} /></div>
                        <p>Step {showOtpModal ? '2' : '1'} of 2  /  {showOtpModal ? 'Verify your email' : 'Tell us about yourself'}</p>
                    </div>

                    <form className='signup-form' onSubmit={handleSubmit}>

                        {/* firstname and lastname */}
                        <div className='signup-name-row'>
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
                                                aria-label={showPassword ? "Hide password" : "Show password"}
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
                                            <IconButton aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => { setShowConfirmPassword(!showConfirmPassword) }} edge="end">
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



                        <div className='signup-terms'>
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
                            className='signup-submit'
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className='signup-login'>
                        <Typography variant='body2' className='text-slate-600'>
                            Already have an account?

                            <Link href="/login" underline='hover' className='!ml-4 text-blue-600 font-bold cursor-pointer'>
                                Login here
                            </Link>
                        </Typography>
                    </div>
                </section>
            </main>


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
                <div className='signup-otp relative max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8'>
                    <p className='signup-otp-step'>Step 2 of 2  /  Verify email</p>
                    <div className='signup-progress-track' aria-hidden='true'><span style={{ width: '100%' }} /></div>
                    <div className='text-center'>

                        <div className='signup-envelope' aria-hidden='true'>
                            <div className='signup-envelope-glow' />
                            <div className='signup-envelope-back' />
                            <div className='signup-envelope-logo'><School /></div>
                            <div className='signup-envelope-front' />
                        </div>
                        <Typography variant='h5' className='signup-verify-title'>
                            Check your verification code
                        </Typography>
                        <Typography variant='body2' className='text-slate-500 mt-2'>
                            Enter the 6-digit code sent to
                        </Typography>
                        <Typography variant='body2' className='font-bold text-blue-600 mt-1 break-all'>
                            {email}
                        </Typography>
                    </div>

                    <div className='signup-code-field'>
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
                        className='signup-verify-button'
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
