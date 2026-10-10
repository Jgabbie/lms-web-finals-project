
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Button, IconButton, Tooltip } from '@mui/material'
import { Dashboard, MenuBook, Assignment, Menu, ChevronLeft, FolderCopy, Forum, Logout, Person } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProfileInitials, getStoredProfile } from '../utils/profileStorage'
import api from '../api/axiosClient'

export default function Sidebar() {
    const [open, setOpen] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(getStoredProfile)

    useEffect(() => {
        const refreshProfile = () => setProfile(getStoredProfile())
        window.addEventListener('profile:updated', refreshProfile)
        return () => window.removeEventListener('profile:updated', refreshProfile)
    }, [])

    const handleLogout = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            await api.post('/auth/logout', {
                firstName: profile.firstName || storedUser.firstName,
                lastName: profile.lastName || storedUser.lastName,
                role: profile.role || storedUser.role || localStorage.getItem('role')
            })
        } catch (error) {
            console.error('Unable to record logout:', error)
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('user')
            localStorage.removeItem('user_profile')
            window.dispatchEvent(new Event('auth:logout'))
            navigate('/login', { replace: true })
        }
    }

    const mainMenu = [
        {
            label: 'Dashboard',
            icon: <Dashboard />,
            path: '/student/dashboard'
        },
        {
            label: 'My Courses',
            icon: <MenuBook />,
            path: '/student/courses'
        },
        {
            label: 'Assignments',
            icon: <Assignment />,
            path: '/student/assignments'
        },
        {
            label: 'Learning Materials',
            icon: <FolderCopy />,
            path: '/student/materials'
        },
        {
            label: 'Discussions',
            icon: <Forum />,
            path: '/student/discussions'
        },
    ]

    const accountMenu = [
        {
            label: 'Profile',
            icon: <Person />,
            path: '/profile'
        },
    ]

    const drawerWidth = open ? 260 : 72

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

            <Drawer variant='permanent' anchor='left' sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff' }, }}>
                <div className={`h-20 flex items-center ${open ? 'px-6' : 'justify-center'} `}>

                    {open ? (
                        <div>
                            <Typography variant='h6' className='!font-bold !text-blue-600'>
                                EduLearn
                            </Typography>

                            <Typography variant='caption' className='!text-slate-400'>
                                Learning Management System
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
                        {mainMenu.map((item) => (
                            <ListItem key={item.label} disablePadding className='!mb-1'>
                                <Tooltip
                                    title={!open ? item.label : ''}
                                    placement='right'
                                >
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        selected={location.pathname === item.path}
                                        sx={{
                                            borderRadius: '8px',
                                            minHeight: 46,
                                            justifyContent: open
                                                ? 'initial'
                                                : 'center',
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
                                                color: location.pathname === item.path ? '#2563eb' : "#64748b"
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                }}
                                            />
                                        )}

                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        ))}
                    </List>

                    {open && (
                        <Typography variant='caption' className='!px-3 !font-semibold !text-slate-400 !uppercase !tracking-wider'>
                            Account
                        </Typography>
                    )}

                    <List>
                        {accountMenu.map((item) => (
                            <ListItem
                                key={item.label}
                                disablePadding
                                className='!mb-1'>
                                <Tooltip
                                    title={!open ? item.label : ''}
                                    placement='right'
                                >
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        selected={location.pathname === item.path}
                                        sx={{
                                            borderRadius: '8px',
                                            minHeight: 46,
                                            justifyContent: open
                                                ? 'initial'
                                                : 'center'
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: open ? 40 : 0,
                                                mr: open ? 1 : 0,
                                                justifyContent: 'center',
                                                color: location.pathname === item.path ? '#2563eb' : '#64748b'
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>

                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                }}
                                            />
                                        )}

                                    </ListItemButton>
                                </Tooltip>

                            </ListItem>
                        ))}
                    </List>
                </div>

                <div className='mt-auto'>
                    <Divider />

                    <div className={`${open ? 'p-4' : 'p-2'}`}>
                        <div className={`flex items-center 
                            ${open
                                ? 'gap-3 mb-3'
                                : 'justify-center mb-3'
                            } `}>
                            <Avatar src={profile.profileImage || undefined} className='!bg-blue-600'>
                                {getProfileInitials(profile)}
                            </Avatar>

                            {open && (
                                <div>
                                    <Typography variant='body2' className='!font-semibold !text-slate-700 !truncate'>
                                        {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'User'}
                                    </Typography>

                                    <Typography variant='caption' className='text-slate-400 !block !truncate'>
                                        {profile.role || 'Student'}
                                    </Typography>
                                </div>
                            )}
                        </div>

                        <Tooltip
                            title={!open ? 'Logout' : ''}
                            placement='right'
                        >
                            <Button
                                fullWidth
                                onClick={handleLogout}
                                startIcon={<Logout />}
                                className={`!justify-start !normal-case !text-slate-500 hover:!bg-red-50 hover:!text-red-600 !rounded-lg
                                ${open ? '!justify-start' : '!justify-center'}
                                `}
                            >
                                {open && 'Logout'}
                            </Button>
                        </Tooltip>


                    </div>
                </div>
            </Drawer >
        </>


    )
}
