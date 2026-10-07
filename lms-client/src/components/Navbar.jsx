import { useEffect, useState } from "react"
import '../App.css'
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar, Badge, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { getProfileInitials, getStoredProfile } from '../utils/profileStorage'


const pages = []

export default function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)
    const [profile, setProfile] = useState(getStoredProfile)

    useEffect(() => {
        const refreshProfile = () => setProfile(getStoredProfile())
        window.addEventListener('profile:updated', refreshProfile)
        return () => window.removeEventListener('profile:updated', refreshProfile)
    }, [])

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget)
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
    const handleCloseNavMenu = () => setAnchorElNav(null)
    const handleCloseUserMenu = () => setAnchorElUser(null)
    const navigateTo = (path) => {
        handleCloseNavMenu()
        handleCloseUserMenu()
        navigate(path)
    }
    const handleLogout = () => {
        handleCloseUserMenu()
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        window.dispatchEvent(new Event('auth:logout'))
        navigate('/login', { replace: true })
    }

    return (
        <>
            <AppBar position="sticky" className="bg-white text-slate-800 shadow-sm border-b border-slate-200">
                <Toolbar className="flex justify-between items-center px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <div className="md:hidden">
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                                <MenuIcon />
                            </IconButton>
                            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu} className="md:hidden">
                                {pages.map((page) => (
                                    <MenuItem key={page.path} onClick={() => navigateTo(page.path)}>
                                        <Typography textAlign="center">{page.label}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>

                        <Typography onClick={() => navigateTo('/student/dashboard')} variant="h6" noWrap className="font-bold text-white-600 tracking-wide cursor-pointer">EduLearn LMS</Typography>
                    </div>

                    <div className="hidden md:flex gap-6 items-center">
                        {pages.map((page) => (
                            <Button key={page.path} onClick={() => navigateTo(page.path)} className={`${location.pathname === page.path ? '!text-blue-600' : '!text-slate-600'} font-medium hover:!text-blue-600 transition-colors duration-200`}>
                                {page.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <IconButton onClick={() => navigateTo('/notifications')} color="inherit" className="text-slate-600 hover:bg-slate-100" aria-label="Open notifications">
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <IconButton onClick={handleOpenUserMenu} className="p-0">
                            <Avatar alt="Student Profile" src={profile.profileImage || undefined} className="w-9 h-9 border-2 border-blue-500">
                                {getProfileInitials(profile)}
                            </Avatar>
                        </IconButton>

                        <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} className="mt-1">
                            <MenuItem onClick={() => navigateTo('/profile')}>Profile</MenuItem>
                            <MenuItem onClick={() => navigateTo('/settings')}>Settings</MenuItem>
                            <MenuItem onClick={handleLogout} className="text-red-500">Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </>
    )
}