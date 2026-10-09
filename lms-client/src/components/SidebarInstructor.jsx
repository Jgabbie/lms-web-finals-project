import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Avatar,
    Divider,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material'
import {
    Dashboard,
    MenuBook,
    People,
    PersonAdd,
    CloudUpload,
    Assignment,
    Person,
    Logout,
    Menu,
    ChevronLeft
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getProfileInitials, getStoredProfile } from '../utils/profileStorage'
import api from '../api/axiosClient'

export default function SidebarInstructor({ open: controlledOpen, setOpen: setControlledOpen }) {
    const [internalOpen, setInternalOpen] = useState(true)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = setControlledOpen || setInternalOpen
    const navigate = useNavigate()
    const location = useLocation()
    const [profile, setProfile] = useState(getStoredProfile)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

    useEffect(() => {
        const refreshProfile = () => setProfile(getStoredProfile())
        window.addEventListener('profile:updated', refreshProfile)
        return () => window.removeEventListener('profile:updated', refreshProfile)
    }, [])

    const mainMenu = [
        { label: 'Dashboard', icon: <Dashboard />, path: '/instructor/dashboard' },
        { label: 'Courses', icon: <MenuBook />, path: '/instructor/courses' },
        { label: 'Students', icon: <People />, path: '/instructor/students' },
        { label: 'Enroll Student', icon: <PersonAdd />, path: '/instructor/enroll' },
        { label: 'Learning Materials', icon: <CloudUpload />, path: '/instructor/materials' },
        { label: 'Assignments', icon: <Assignment />, path: '/instructor/assignments' },
    ]

    const handleConfirmLogout = async () => {
        setLogoutDialogOpen(false)
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            await api.post('/auth/logout', {
                firstName: profile.firstName || storedUser.firstName,
                lastName: profile.lastName || storedUser.lastName,
                role: profile.role || storedUser.role || localStorage.getItem('role') || 'instructor'
            })
        } catch (error) {
            console.error('Unable to record instructor logout:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('user')
            localStorage.removeItem('user_profile')
            window.dispatchEvent(new Event('auth:logout'))
            navigate('/login', { replace: true })
        }
    }

    const drawerWidth = open ? 260 : 72
    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Instructor'

    return (
        <>
            <IconButton
                onClick={() => setOpen(!open)}
                className='!fixed !top-5 !z-[1300] !bg-white !shadow-sm !border !border-slate-200'
                sx={{
                    left: open ? 240 : 52,
                    transition: 'left 0.25s ease'
                }}
            >
                {open ? <ChevronLeft /> : <Menu />}
            </IconButton>
            <Drawer
                variant='permanent'
                anchor='left'
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff'
                    },
                }}
            >
                <div className={`h-20 flex items-center ${open ? 'px-6' : 'justify-center'}`}>
                    {open ? (
                        <div>
                            <Typography variant='h6' className='!font-bold !text-blue-600'>
                                EduLearn
                            </Typography>
                            <Typography variant='caption' className='!text-slate-400'>
                                Instructor Portal
                            </Typography>
                        </div>
                    ) : (
                        <Typography variant='h6' className='!font-bold !text-blue-600'>
                            E
                        </Typography>
                    )}
                </div>
                <Divider />
                <div className='px-2 pt-4'>
                    {open && (
                        <Typography variant='caption' className='!px-3 !font-semibold !text-slate-400 !uppercase !tracking-wider'>
                            Main Menu
                        </Typography>
                    )}
                    <List>
                        {mainMenu.map((item) => {
                            const isSelected = location.pathname === item.path
                            return (
                                <ListItem key={item.label} disablePadding className='!mb-1'>
                                    <Tooltip title={!open ? item.label : ''} placement='right'>
                                        <ListItemButton
                                            onClick={() => navigate(item.path)}
                                            selected={isSelected}
                                            sx={{
                                                borderRadius: '8px',
                                                minHeight: 46,
                                                justifyContent: open ? 'initial' : 'center',
                                                '&.Mui-selected': {
                                                    backgroundColor: '#eff6ff',
                                                    color: '#2563eb',
                                                },
                                                '&.Mui-selected:hover': {
                                                    backgroundColor: '#dbeafe',
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 40,
                                                    mr: open ? 1 : 0,
                                                    justifyContent: 'center',
                                                    color: isSelected ? '#2563eb' : '#64748b'
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            {open && (
                                                <ListItemText
                                                    primary={item.label}
                                                    primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            )
                        })}
                    </List>
                    {open && (
                        <Typography variant='caption' className='!px-3 !font-semibold !text-slate-400 !uppercase !tracking-wider'>
                            Account
                        </Typography>
                    )}
                    <List>
                        <ListItem disablePadding className='!mb-1'>
                            <Tooltip title={!open ? 'Profile' : ''} placement='right'>
                                <ListItemButton
                                    onClick={() => navigate('/profile')}
                                    selected={location.pathname === '/profile'}
                                    sx={{
                                        borderRadius: '8px',
                                        minHeight: 46,
                                        justifyContent: open ? 'initial' : 'center'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, mr: open ? 1 : 0, justifyContent: 'center', color: '#64748b' }}>
                                        <Person />
                                    </ListItemIcon>
                                    {open && (
                                        <ListItemText
                                            primary='Profile'
                                            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                </div>
                <div className='mt-auto'>
                    <Divider />
                    <div className={`${open ? 'p-4' : 'p-2'}`}>
                        <div className={`flex items-center ${open ? 'gap-3 mb-3' : 'justify-center mb-3'}`}>
                            <Avatar src={profile.profileImage || undefined} className='!bg-blue-600'>
                                {getProfileInitials(profile) || 'IN'}
                            </Avatar>
                            {open && (
                                <div className='min-w-0 flex-1'>
                                    <Typography variant='body2' className='!font-semibold !text-slate-700 !truncate'>
                                        {displayName}
                                    </Typography>
                                    <Typography variant='caption' className='text-slate-400 !block !truncate'>
                                        Instructor
                                    </Typography>
                                </div>
                            )}
                        </div>
                        <Tooltip title={!open ? 'Logout' : ''} placement='right'>
                            <Button
                                fullWidth
                                onClick={() => setLogoutDialogOpen(true)}
                                startIcon={<Logout />}
                                className={`!normal-case !text-slate-500 hover:!bg-red-50 hover:!text-red-600 !rounded-lg ${open ? '!justify-start' : '!justify-center'
                                    }`}
                            >
                                {open && 'Logout'}
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </Drawer>

            {/* Logout Confirmation Modal */}
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    className: '!rounded-2xl !p-2'
                }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className='!text-slate-600'>
                        Are you sure you want to log out of your instructor account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions className='!px-4 !pb-3'>
                    <Button
                        onClick={() => setLogoutDialogOpen(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmLogout}
                        variant="contained"
                        color="error"
                        className='!normal-case !rounded-lg !shadow-none'
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}