import { TextField, Button, Checkbox, FormControlLabel, Typography, Link, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material'
import { VisibilityOff, Visibility, School, MenuBook, Groups } from '@mui/icons-material'
import { useState } from 'react'
import api from '../api/axiosClient'
import { saveStoredProfile } from '../utils/profileStorage'
import './LoginPage.css'

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

        if (!validateForm()) return
        try {
            setLoading(true)

            const res = await api.post('/auth/login', { email: email.trim(), password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('profile', JSON.stringify(res.data));

            const loggedInUser = {
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email,
                role: res.data.role
            }

            localStorage.setItem('user', JSON.stringify(loggedInUser))
            saveStoredProfile(loggedInUser)
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
            <div className='edulogin'>

                <aside className='login-story' aria-label='Welcome to EduLearn'>
                    <div className='login-story-art' aria-hidden='true'><span /><span /><span /></div>
                    <div className='login-story-top'>
                        <div className='login-brand'><School /> EduLearn.</div>
                        <p className='login-eyebrow'>YOUR NEXT CHAPTER STARTS HERE</p>
                        <h2>Learn today.<br />Build your tomorrow.</h2>
                        <p className='login-story-copy'>A little curiosity can take you a long way. Make room for practical skills, fresh ideas, and your next possibility.</p>
                    </div>
                    <div className='login-story-bottom'>
                        <p>A space for every kind of learner</p>
                        <div className='login-audiences'><span><School /> Students</span><span><MenuBook /> Instructors</span><span><Groups /> Learning together</span></div>
                        <span className='login-story-note'>Small steps. Endless possibilities.</span>
                    </div>
                </aside>

                <div className='login-form-panel'>
                    <div className='login-heading'>
                        <Typography variant='h5' className='login-form-brand'>
                            EduLearn LMS
                        </Typography>
                        <Typography variant='h5' className='login-title'>
                            Welcome back
                        </Typography>
                        <Typography variant='body2' className='login-subtitle'>
                            Please enter your details to sign in.
                        </Typography>
                    </div>

                    <form className='login-form' onSubmit={handleSubmit} noValidate>
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
                                            <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => { setShowPassword(!showPassword) }} edge="end">
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                            value={password}
                            onChange={handlePasswordChange}

                        />

                        <div className='login-options'>
                            <Link href="/reset" underline='hover' className='text-sm text-blue-600 font-medium cursor-pointer'>
                                Forgot password?
                            </Link>
                        </div>

                        <Button type='submit' variant='contained' size='large' className='login-submit'>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className='login-signup'>
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
