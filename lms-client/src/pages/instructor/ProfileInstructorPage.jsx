import RoleScreen from '../../components/StudentScreen'
import {
    Avatar,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material'
import {
    EditRounded as Edit,
    LockResetRounded as LockReset,
    PhotoCameraRounded as PhotoCamera,
    PersonOutlineRounded as PersonOutline,
    EmailOutlined,
    BadgeOutlined
} from '@mui/icons-material'
import { useState, useEffect, useRef } from 'react'
import NavbarInstructor from '../../components/NavbarInstructor'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'
import { getStoredProfile, saveStoredProfile, getProfileInitials } from '../../utils/profileStorage'

export default function ProfileInstructorPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [profile, setProfile] = useState(getStoredProfile)

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    })

    const [passwordForm, setPasswordForm] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })
    const fileInputRef = useRef(null)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/profile/user')
                if (res.data?.userData) {
                    const merged = { ...getStoredProfile(), ...res.data.userData }
                    setProfile(merged)
                    saveStoredProfile(merged)
                }
            } catch (err) {
                console.error('Fetch profile error:', err)
            }
        }
        fetchUserData()
    }, [])

    const handleOpenEdit = () => {
        setEditForm({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || ''
        })
        setEditDialogOpen(true)
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        try {
            const res = await api.put('/profile/user/update', editForm)
            const updated = { ...profile, ...res.data.userData }
            setProfile(updated)
            saveStoredProfile(updated)
            setEditDialogOpen(false)
            setNotification({ open: true, message: 'Profile updated successfully!', severity: 'success' })
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to update profile',
                severity: 'error'
            })
        }
    }

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('profileImage', file)

        try {
            setUploadingImage(true)
            const res = await api.post('/profile/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            const updated = { ...profile, profileImage: res.data.profileImage }
            setProfile(updated)
            saveStoredProfile(updated)
            setNotification({ open: true, message: 'Profile image updated successfully!', severity: 'success' })
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to upload profile image',
                severity: 'error'
            })
        } finally {
            setUploadingImage(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setNotification({ open: true, message: 'Passwords do not match', severity: 'error' })
            return
        }
        try {
            await api.post('/profile/change-password/reset', {
                email: profile.email,
                password: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            })
            setPasswordDialogOpen(false)
            setPasswordForm({ newPassword: '', confirmPassword: '' })
            setNotification({ open: true, message: 'Password changed successfully!', severity: 'success' })
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to change password',
                severity: 'error'
            })
        }
    }

    const initials = getProfileInitials(profile)
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Instructor Portal'

    return (
        <RoleScreen page="profileinstructor" role="instructor">
            <div className='min-h-screen bg-slate-50'>
                <NavbarInstructor sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
                <div
                    className='transition-all duration-300'
                    style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
                >
                    <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                       
                        <div className='student-page-heading bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden'>
                            <Typography variant='h4' className='!font-bold'>
                                My Profile
                            </Typography>
                            <Typography variant='body2' className='!text-slate-300 !mt-1'>
                                Manage your account information and profile settings
                            </Typography>
                        </div>

                        
                        <Card className='!rounded-2xl !border !border-slate-200 !shadow-sm !mb-6'>
                            <CardContent className='!p-6 sm:!p-8'>
                                <div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6'>
                                    <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
                                        <div className='relative'>
                                            <Avatar
                                                src={profile.profileImage || ''}
                                                sx={{ width: 100, height: 100 }}
                                                className='!bg-blue-600 !text-white !font-bold !text-2xl shadow-inner'
                                            >
                                                {!profile.profileImage && initials}
                                            </Avatar>
                                            <IconButton
                                                component='label'
                                                size='small'
                                                disabled={uploadingImage}
                                                className='!absolute !bottom-0 !right-0 !bg-blue-600 hover:!bg-blue-700 !text-white !shadow-md'
                                            >
                                                <PhotoCamera fontSize='small' />
                                                <input
                                                    ref={fileInputRef}
                                                    hidden
                                                    type='file'
                                                    accept='image/*'
                                                    onChange={handleImageSelect}
                                                />
                                            </IconButton>
                                        </div>

                                        <div className='text-center sm:text-left'>
                                            <Typography variant='h5' className='!font-bold !text-slate-800'>
                                                {fullName}
                                            </Typography>
                                            <Typography variant='body2' className='!text-slate-500 !mt-0.5'>
                                                {profile.email || 'instructor@portal.com'}
                                            </Typography>
                                            <div className='mt-3 flex items-center justify-center sm:justify-start gap-2'>
                                                <Chip
                                                    label='Instructor'
                                                    size='small'
                                                    className='!bg-blue-50 !text-blue-700 !font-semibold'
                                                />
                                                {uploadingImage && (
                                                    <span className='text-xs text-blue-600 animate-pulse font-medium'>
                                                        Uploading avatar...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant='outlined'
                                        startIcon={<Edit />}
                                        onClick={handleOpenEdit}
                                        className='!rounded-xl !normal-case !border-slate-300 !text-slate-700'
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <Card className='!rounded-2xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>
                                    <Typography variant='h6' className='!font-bold !text-slate-800 !mb-4'>
                                        Personal Information
                                    </Typography>
                                    <div className='space-y-4'>
                                        <div>
                                            <Typography variant='caption' className='!text-slate-400 block mb-1'>
                                                First Name
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size='small'
                                                value={profile.firstName || ''}
                                                disabled
                                                slotProps={{ input: { startAdornment: <PersonOutline className='!text-slate-400 !mr-2' /> } }}
                                            />
                                        </div>
                                        <div>
                                            <Typography variant='caption' className='!text-slate-400 block mb-1'>
                                                Last Name
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size='small'
                                                value={profile.lastName || ''}
                                                disabled
                                                slotProps={{ input: { startAdornment: <PersonOutline className='!text-slate-400 !mr-2' /> } }}
                                            />
                                        </div>
                                        <div>
                                            <Typography variant='caption' className='!text-slate-400 block mb-1'>
                                                Email Address
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size='small'
                                                value={profile.email || ''}
                                                disabled
                                                slotProps={{ input: { startAdornment: <EmailOutlined className='!text-slate-400 !mr-2' /> } }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='!rounded-2xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>
                                    <Typography variant='h6' className='!font-bold !text-slate-800 !mb-4'>
                                        Security & Access
                                    </Typography>
                                    <div className='space-y-4'>
                                        <div>
                                            <Typography variant='caption' className='!text-slate-400 block mb-1'>
                                                Account Role
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size='small'
                                                value='INSTRUCTOR'
                                                disabled
                                                slotProps={{ input: { startAdornment: <BadgeOutlined className='!text-slate-400 !mr-2' /> } }}
                                            />
                                        </div>
                                        <div className='pt-4'>
                                            <Button
                                                variant='contained'
                                                fullWidth
                                                startIcon={<LockReset />}
                                                onClick={() => setPasswordDialogOpen(true)}
                                                className='!bg-slate-800 hover:!bg-slate-900 !normal-case !rounded-xl !py-2.5 !shadow-none'
                                            >
                                                Change Account Password
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>

               
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth='xs'>
                    <DialogTitle className='!font-bold !text-slate-800'>Edit Profile</DialogTitle>
                    <form onSubmit={handleSaveProfile}>
                        <DialogContent>
                            <div className='space-y-4 mt-1'>
                                <TextField
                                    fullWidth
                                    required
                                    label='First Name'
                                    value={editForm.firstName}
                                    onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    required
                                    label='Last Name'
                                    value={editForm.lastName}
                                    onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    required
                                    type='email'
                                    label='Email Address'
                                    value={editForm.email}
                                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-5'>
                            <Button onClick={() => setEditDialogOpen(false)} className='!normal-case !text-slate-600'>
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

              
                <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth='xs'>
                    <DialogTitle className='!font-bold !text-slate-800'>Change Password</DialogTitle>
                    <form onSubmit={handleChangePassword}>
                        <DialogContent>
                            <div className='space-y-4 mt-1'>
                                <TextField
                                    fullWidth
                                    required
                                    type='password'
                                    label='New Password'
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    required
                                    type='password'
                                    label='Confirm New Password'
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-5'>
                            <Button onClick={() => setPasswordDialogOpen(false)} className='!normal-case !text-slate-600'>
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Update Password
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Snackbar
                    open={notification.open}
                    autoHideDuration={3000}
                    onClose={() => setNotification(p => ({ ...p, open: false }))}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity={notification.severity} variant='filled'>
                        {notification.message}
                    </Alert>
                </Snackbar>
            </div>
        </RoleScreen>
    )
}