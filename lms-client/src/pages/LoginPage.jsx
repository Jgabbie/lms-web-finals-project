import { TextField, Button, Checkbox, FormControlLabel, Typography, Link, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material'
import { VisibilityOff, Visibility, AssignmentReturnOutlined } from '@mui/icons-material'
import { useState } from 'react'
import axios from 'axios'

export default function LoginPage({ onLogin }) {

    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

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

    const validateForm = () => {
        let isValid = true

        const trimmedEmail = email.trim()
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        setEmailError('')
        setPasswordError('')

        if (!trimmedEmail) {
            setEmailError('Email address is required')
            isValid = false
        } else if (!emailPattern.test(trimmedEmail)) {
            setEmailError('Please enter a valid email address')
            isValid = false
        }

        if (!password) {
            setPasswordError('Password is required')
            isValid = false
        }

        return isValid
    }

    const handleEmailChange = (e) => {
        const value = e.target.value.replace(/\s/g, '')
        setEmail(value)

        if (emailError) {
            setEmailError('')
        }
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)

        if (passwordError) {
            setPasswordError('')
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) AssignmentReturnOutlined
        try {
            setLoading(true)

            const res = await axios.post('http://localhost:5000/api/auth/login', { email: email.trim(), password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);

            localStorage.setItem('user', JSON.stringify({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email,
                role: res.data.role
            }));
            onLogin(res.data.role);
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid Email or Password'
            showNotification(message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className=' relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4'>

                <div className='absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/60 ' />
                <div className='absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/60 ' />
                <div className='absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-blue-200/60 ' />

                <div className='relative z-10 max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10'>
                    <div className='text-center mb-8'>
                        <Typography variant='h5' className='font-bold text-blue-600 tracking-wide mb-2'>
                            EduLearn LMS
                        </Typography>
                        <Typography variant='h5' className='font-bold text-slate-800'>
                            Welcome back
                        </Typography>
                        <Typography variant='body2' className='text-slate-500 mt-2'>
                            Please enter your details to sign in.
                        </Typography>
                    </div>

                    <form className='flex flex-col gap-5' onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Email Address"
                            type='email'
                            variant='outlined'
                            fullWidth
                            required
                            value={email}
                            onChange={handleEmailChange}
                            error={Boolean(emailError)}
                            helperText={emailError}
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            variant='outlined'
                            fullWidth
                            required
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton onClick={() => { setShowPassword(!showPassword) }} edge="end">
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                            value={password}
                            onChange={handlePasswordChange}

                        />

                        <div className='flex items-center justify-between -mt-2'>
                            <FormControlLabel control={<Checkbox size='small' className='text-blue-600' />} label={<Typography variant='body2' className='text-slate-600'>Remember Me</Typography>} />
                            <Link href="#" underline='hover' className='text-sm text-blue-600 font-medium cursor-pointer'>
                                Forgot password?
                            </Link>
                        </div>

                        <Button type='submit' variant='contained' size='large' className='bg-blue-600 hover:bg-blue-700 normal-case shadow-none rounded-lg py-3 mt-2 text-base font-medium'>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className='mt-8 text-center'>
                        <Typography variant='body2' className='text-slate-600'>
                            Don't have an account?

                            <Link href="/signup" underline='hover' className='!ml-4 text-blue-600 font-bold cursor-pointer'>
                                Sign up for free
                            </Link>
                        </Typography>
                    </div>
                </div>
            </div>

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
