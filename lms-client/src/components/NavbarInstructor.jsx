import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material'
import {
    NotificationsOutlined,
    PersonOutlined,
    LockResetOutlined,
    LogoutOutlined,
    CheckCircleOutlined,
    DoneAllOutlined,
    Menu as MenuIcon
} from '@mui/icons-material'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import { getStoredProfile, getProfileInitials } from '../utils/profileStorage'

export default function NavbarInstructor({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(getStoredProfile)
    
    
    const [notifications, setNotifications] = useState([])
    const [notifAnchorEl, setNotifAnchorEl] = useState(null)
    
    const [profileAnchorEl, setProfileAnchorEl] = useState(null)

    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

  
    useEffect(() => {
        const handleProfileUpdate = () => {
            setProfile(getStoredProfile())
        }
        window.addEventListener('profile:updated', handleProfileUpdate)
        return () => window.removeEventListener('profile:updated', handleProfileUpdate)
    }, [])

    
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/notifications')
            if (res.data?.notifications) {
                setNotifications(res.data.notifications)
            }
        } catch {
         
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    const unreadCount = notifications.filter(n => n.unread).length

    
    const handleOpenProfileMenu = (e) => setProfileAnchorEl(e.currentTarget)
    const handleCloseProfileMenu = () => setProfileAnchorEl(null)

    const handleOpenNotifMenu = (e) => setNotifAnchorEl(e.currentTarget)
    const handleCloseNotifMenu = () => setNotifAnchorEl(null)

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
        } catch (err) {
            console.error('Error marking read:', err)
        }
    }

    const handleConfirmLogout = async () => {
        try {
            setLoggingOut(true)
            await api.post('/auth/logout', {
                firstName: profile.firstName || 'Instructor',
                lastName: profile.lastName || 'User',
                role: 'instructor'
            })
        } catch {
           
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('user')
            localStorage.removeItem('user_profile')
            window.dispatchEvent(new Event('auth:logout'))
            setLogoutDialogOpen(false)
            setLoggingOut(false)
            navigate('/login')
        }
    }

    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Instructor Portal'
    const initials = getProfileInitials(profile)

    return (
        <>
            <AppBar
                position='sticky'
                elevation={0}
                className='!bg-white !border-b !border-slate-200 !text-slate-800 z-30'
            >
                <Toolbar className='flex justify-between items-center px-4 sm:px-6 min-h-[70px]'>
                    
                    <Box className='flex items-center gap-3'>
                        {setSidebarOpen && (
                            <IconButton
                                size='small'
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className='!text-slate-600 hover:!bg-slate-100'
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography
                            variant='h6'
                            className='!font-extrabold !text-slate-800 cursor-pointer select-none'
                            onClick={() => navigate('/instructor/dashboard')}
                        >
                            EduLearn <span className='text-blue-600'>LMS</span>
                        </Typography>
                    </Box>

                
                    <Box className='flex items-center gap-3'>
                        <IconButton
                            size='medium'
                            onClick={handleOpenNotifMenu}
                            className='!bg-amber-50 hover:!bg-amber-100 !text-slate-700 transition'
                        >
                            <Badge badgeContent={unreadCount} color='error'>
                                <NotificationsOutlined />
                            </Badge>
                        </IconButton>

                        <IconButton
                            onClick={handleOpenProfileMenu}
                            size='small'
                            className='!p-0.5 !border-2 !border-slate-300 hover:!border-blue-500 transition'
                        >
                            <Avatar
                                src={profile.profileImage || ''}
                                sx={{ width: 40, height: 40 }}
                                className='!bg-slate-400 !text-white !font-bold !text-sm'
                            >
                                {!profile.profileImage && initials}
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={notifAnchorEl}
                        open={Boolean(notifAnchorEl)}
                        onClose={handleCloseNotifMenu}
                        slotProps={{
                            paper: {
                                className: '!rounded-2xl !shadow-xl !border !border-slate-200 !w-80 sm:!w-96 !p-0 mt-2'
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <div className='p-4 flex items-center justify-between border-b border-slate-100'>
                            <div className='flex items-center gap-2'>
                                <Typography className='!font-bold !text-slate-800'>
                                    Notifications
                                </Typography>
                                {unreadCount > 0 && (
                                    <span className='px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full'>
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    size='small'
                                    startIcon={<DoneAllOutlined fontSize='small' />}
                                    onClick={handleMarkAllRead}
                                    className='!normal-case !text-xs !text-blue-600'
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>

                        <div className='max-h-72 overflow-y-auto divide-y divide-slate-50'>
                            {notifications.length > 0 ? (
                                notifications.slice(0, 5).map(n => (
                                    <div
                                        key={n.id || n._id}
                                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                                            n.unread ? 'bg-blue-50/40' : ''
                                        }`}
                                        onClick={() => {
                                            handleCloseNotifMenu()
                                            navigate('/notifications')
                                        }}
                                    >
                                        <div className='flex items-start gap-2.5'>
                                            <CheckCircleOutline fontSize='small' className='text-blue-600 mt-0.5 shrink-0' />
                                            <div className='min-w-0 flex-1'>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800 truncate'>
                                                    {n.title}
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-500 line-clamp-2 mt-0.5 block'>
                                                    {n.message}
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='py-8 text-center text-slate-400 text-sm'>
                                    No notifications found
                                </div>
                            )}
                        </div>

                        <Divider />
                        <div className='p-2 text-center'>
                            <Button
                                fullWidth
                                size='small'
                                onClick={() => {
                                    handleCloseNotifMenu()
                                    navigate('/notifications')
                                }}
                                className='!normal-case !text-blue-600 !font-semibold'
                            >
                                View All Notifications
                            </Button>
                        </div>
                    </Menu>

                    <Menu
                        anchorEl={profileAnchorEl}
                        open={Boolean(profileAnchorEl)}
                        onClose={handleCloseProfileMenu}
                        slotProps={{
                            paper: {
                                className: '!rounded-2xl !shadow-xl !border !border-slate-200 !w-64 !p-2 mt-2'
                            }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <div className='px-4 py-3'>
                            <Typography className='!font-bold !text-slate-800 !text-sm leading-tight'>
                                {displayName}
                            </Typography>
                            <Typography variant='caption' className='!text-slate-500 block truncate mt-0.5'>
                                {profile.email || 'instructor@portal.com'}
                            </Typography>
                            <span className='inline-block mt-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full'>
                                Instructor
                            </span>
                        </div>

                        <Divider className='!my-1' />

                        <MenuItem
                            onClick={() => {
                                handleCloseProfileMenu()
                                navigate('/profile')
                            }}
                            className='!rounded-xl !py-2.5'
                        >
                            <ListItemIcon>
                                <PersonOutlined fontSize='small' className='text-slate-600' />
                            </ListItemIcon>
                            <Typography variant='body2' className='!font-medium !text-slate-700'>
                                My Profile
                            </Typography>
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleCloseProfileMenu()
                                navigate('/profile')
                            }}
                            className='!rounded-xl !py-2.5'
                        >
                            <ListItemIcon>
                                <LockResetOutlined fontSize='small' className='text-slate-600' />
                            </ListItemIcon>
                            <Typography variant='body2' className='!font-medium !text-slate-700'>
                                Change Password
                            </Typography>
                        </MenuItem>

                        <Divider className='!my-1' />

                        <MenuItem
                            onClick={() => {
                                handleCloseProfileMenu()
                                setLogoutDialogOpen(true)
                            }}
                            className='!rounded-xl !py-2.5 !text-red-600 hover:!bg-red-50'
                        >
                            <ListItemIcon>
                                <LogoutOutlined fontSize='small' className='text-red-600' />
                            </ListItemIcon>
                            <Typography variant='body2' className='!font-medium !text-red-600'>
                                Log Out
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

  
            <Dialog
                open={logoutDialogOpen}
                onClose={() => !loggingOut && setLogoutDialogOpen(false)}
                maxWidth='xs'
                fullWidth
                slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className='!text-slate-600 text-sm'>
                        Are you sure you want to log out of your instructor account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions className='!px-4 !pb-3'>
                    <Button
                        onClick={() => setLogoutDialogOpen(false)}
                        disabled={loggingOut}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmLogout}
                        variant='contained'
                        color='error'
                        disabled={loggingOut}
                        className='!normal-case !rounded-lg !shadow-none'
                    >
                        {loggingOut ? 'Logging out...' : 'Log Out'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}