import { Card, CardContent, Typography, Button, Avatar, Divider, TextField, Alert, CircularProgress, Snackbar, InputAdornment, IconButton, Modal } from '@mui/material'
import { Person, Email, Lock, Edit, Save, Close, Visibility, VisibilityOff, PhotoCamera } from '@mui/icons-material'
import { useState, useMemo, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axiosClient'
import { getStoredProfile, saveStoredProfile } from '../utils/profileStorage'

const getApiMessage = (error, fallback) => error?.data?.message || error?.message || fallback || 'Something went wrong'

export default function ProfilePage() {

    const [profile, setProfile] = useState(getStoredProfile)
    const [draft, setDraft] = useState(getStoredProfile)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [selectedImageFile, setSelectedImageFile] = useState(null)
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOtp] = useState('')

    const [passwordError, setPasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')
    const [otpError, setOtpError] = useState('')

    const [loading, setLoading] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [showOtpModal, setShowOtpModal] = useState(false)
    const [showResetModal, setShowResetModal] = useState(false)

    const initials = useMemo(() => {
        const firstInitial = profile.firstName?.[0] || ''
        const lastInitial = profile.lastName?.[0] || ''
        return `${firstInitial}${lastInitial}`.toUpperCase()
    }, [profile])

    const displayName = useMemo(() => {
        return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User'
    }, [profile])

    const loadProfile = async () => {
        setLoading(true)
        setError(null)
        const storedProfile = getStoredProfile()
        setProfile(storedProfile)
        setDraft(storedProfile)
        try {
            const response = await api.get('/profile/user')
            const user = response?.data?.userData || response?.data?.user || {}
            const next = {
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                role: user?.role || '',
                profileImage: user?.profileImage || '',
            }
            saveStoredProfile(next)
            setProfile(next)
            setDraft(next)
        } catch (error) {
            console.error('Error loading profile:', error)
            setError(getApiMessage(error, 'Failed to load profile'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const updateDraft = (field) => (event) => {
        setDraft((prev) => ({ ...prev, [field]: event.target.value }))
    }

    const handleProfileImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should not exceed 5MB.')
            return
        }

        const previewUrl = URL.createObjectURL(file)
        setSelectedImage(previewUrl)
        setSelectedImageFile(file)
        setShowImagePreview(true)
        setError(null)

        event.target.value = ''
    }


    const closeImagePreview = () => {
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage)
        }

        setSelectedImage(null)
        setSelectedImageFile(null)
        setShowImagePreview(false)
    }


    const confirmProfileImageUpload = async () => {
        if (!selectedImageFile) {
            setError('No image selected for upload.')
            return
        }

        const formData = new FormData()
        formData.append('profileImage', selectedImageFile)

        try {
            setUploadingImage(true)

            const response = await api.post('/profile/upload-profile-image', formData)

            const imageUrl = response?.data?.profileImage || ''

            const next = saveStoredProfile({ ...profile, profileImage: imageUrl })
            setProfile(next)
            setDraft(next)
            showNotification('Profile image updated successfully.', 'success')
            setSelectedImage(null)
            setSelectedImageFile(null)
            setShowImagePreview(false)
        } catch (error) {
            console.error('Error uploading profile image:', error)
            setError(getApiMessage(error, 'Failed to upload profile image.'))
        } finally {
            setUploadingImage(false)
        }

    }



    const handleSaveChanges = async () => {
        setError('')
        setMessage('')

        const fields = {
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            email: draft.email.trim(),
        }

        if (!fields.firstName || !fields.lastName || !fields.email) {
            setError('Please fill in all required fields.')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            setError('Please enter a valid email address.')
            return
        }

        try {
            setSaving(true)
            const response = await api.put('/profile/user/update', fields)
            const user = response?.data?.userData || response?.data?.user || {}
            const next = {
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                email: user?.email || '',
                role: user?.role || '',
                profileImage: user?.profileImage || '',
            }
            const storedNext = saveStoredProfile(next)
            setProfile(storedNext)
            setDraft(storedNext)
            setEditing(false)
            setMessage('Profile updated successfully.')
        } catch (error) {
            console.error('Error updating profile:', error)
            setError(getApiMessage(error, 'Failed to update profile changes.'))
        } finally {
            setSaving(false)
        }
    }

    const cancelEdit = () => {
        setDraft(profile)
        setEditing(false)
        setError('')
    }

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


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!profile.email) {
            setPasswordError('Email is required.')
            return
        }

        try {
            setResendLoading(true)
            setOtpError('')
            await api.post('/profile/change-password/send-otp', { email: profile.email.trim().toLowerCase() })
            setShowOtpModal(true)
        } catch (error) {
            console.error('Request password OTP error:', error)
            setOtpError(error?.response?.data?.message || 'Unabel to send OTP. Please try again.')
        } finally {
            setResendLoading(false)
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
            setResendLoading(true)
            setOtpError('')

            const response = await api.post('/profile/change-password/verify-otp',
                {
                    email: profile.email.trim().toLowerCase(),
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
            setResendLoading(false)
        }
    }


    const handleResendOtp = async () => {
        try {
            setResendLoading(true)
            setOtpError('')

            const response = await api.post('/profile/change-password/resend-otp',
                {
                    email: profile.email.trim().toLowerCase(),
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
            setResendLoading(false)
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

            const response = await api.post('/profile/change-password/reset',
                {
                    email: profile.email.trim().toLowerCase(),
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
            setShowOtpModal(false)
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
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-6'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            My Profile
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Manage your account information and profile settings
                        </Typography>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-6'>
                            <div className='flex flex-col sm:flex-row sm:items-center gap-5'>

                                <div className='relative w-fit'>
                                    <Avatar
                                        src={profile.profileImage || ''}
                                        sx={{ width: 88, height: 88, fontSize: 32 }}
                                        className='!bg-blue-600'
                                    >
                                        {!profile.profileImage && initials}
                                    </Avatar>

                                    <input
                                        id="profile-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageUpload}
                                        hidden
                                        disabled={uploadingImage}
                                    />

                                    <label htmlFor="profile-image-upload">
                                        <IconButton
                                            component="span"
                                            disabled={uploadingImage}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: 32,
                                                height: 32,
                                                backgroundColor: '#2563eb',
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: '#1d4ed8',
                                                },
                                            }}
                                        >
                                            {uploadingImage ? (
                                                <CircularProgress size={17} color='inherit' />
                                            ) : (
                                                <Edit />
                                            )}
                                        </IconButton>
                                    </label>
                                </div>

                                <div className='flex-1'>
                                    <Typography variant='h5' className='!font-bold !text-slate-800'>
                                        {displayName}
                                    </Typography>

                                    <Typography variant='body2' className='!text-slate-500'>
                                        {profile.email}
                                    </Typography>

                                    <div className='mt-2'>
                                        <span className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold'>
                                            Administrator
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant='outlined'
                                    startIcon={<Edit />}
                                    onClick={() => {
                                        setDraft(profile)
                                        setEditing(true)
                                        setError('')
                                        setMessage('')
                                    }}
                                    className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'>
                                    Edit Profile
                                </Button>
                            </div>

                            <Divider className='!my-6' />

                            <div className='mb-6'>
                                <Typography variant='h6' className='!font-bold !text-slate-800'>
                                    Personal Information
                                </Typography>

                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Update your personal account information
                                </Typography>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    value={draft.firstName}
                                    onChange={updateDraft('firstName')}
                                    disabled={!editing || saving}
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <Person className='!text-slate-400 !mr-2' />
                                            )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    value={draft.lastName}
                                    onChange={updateDraft('lastName')}
                                    disabled={!editing || saving}
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <Person className='!text-slate-400 !mr-2' />
                                            )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={draft.email}
                                    onChange={updateDraft('email')}
                                    disabled={!editing || saving}
                                    type='email'
                                    InputProps={{
                                        startAdornment:
                                            (
                                                <Email className='!text-slate-400 !mr-2' />
                                            )
                                    }}
                                />
                            </div>

                            {editing && (
                                <div className='flex justify-end mt-6'>
                                    <Button
                                        variant='contained'
                                        startIcon={<Close />}
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className='!normal-case !rounded-lg !bg-slate-300 !text-slate-700'
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant='contained'
                                        startIcon={
                                            saving ? (
                                                <CircularProgress size={18} color='inherit' />
                                            ) : (
                                                <Save />
                                            )
                                        }
                                        onClick={handleSaveChanges}
                                        disabled={saving}
                                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                            )}

                        </CardContent>
                    </Card>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mt-6'>
                        <CardContent className='!p-6'>
                            <div className='flex items-start gap-3 mb-6'>
                                <div className='w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center'>
                                    <Lock />
                                </div>

                                <div>
                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                        Security
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        Manage your account password
                                    </Typography>
                                </div>
                            </div>

                            <div className='flex justify-end mt-6'>
                                <Button
                                    variant='outlined'
                                    startIcon={<Lock />}
                                    onClick={handleSubmit}
                                    className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                >
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
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
                            We sent a 6-digits verification code to your email
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


            <Modal
                open={showImagePreview}
                onClose={() => {
                    if (!uploadingImage) {
                        closeImagePreview()
                    }
                }}
                className='flex items-center justify-center p-4'
            >
                <div className='relative w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 outline-none'>
                    <div className='flex items-center justify-between mb-5'>
                        <Typography variant='h6' className='font-bold text-slate-800'>
                            Preview Profile Image
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Make sure to click "Confirm Upload" to save the changes
                        </Typography>
                    </div>

                    <IconButton
                        onClick={closeImagePreview}
                        disabled={uploadingImage}
                    >
                        <Close />
                    </IconButton>


                    <div className='flex justify-center bg-slate-50 rounded-xl p-5'>
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Profile Preview"
                                className='w-64 h-64 object-cover rounded-full border-4 border-white shadow-md'
                            />
                        )}
                    </div>

                    <div className='flex justify-end gap-3 mt-6'>
                        <Button
                            variant='outlined'
                            onClick={closeImagePreview}
                            disabled={uploadingImage}
                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                        >
                            Cancel
                        </Button>

                        <Button
                            variant='contained'
                            onClick={confirmProfileImageUpload}
                            disabled={uploadingImage || !selectedImageFile}
                            startIcon={uploadingImage ? <CircularProgress size={18} color='inherit' /> : <PhotoCamera />}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
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
