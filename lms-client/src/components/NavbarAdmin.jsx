import { useState } from "react"
import '../App.css'
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar, Badge, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNavigate } from "react-router-dom"


const pages = [
    { name: 'Users', path: '/admin/users' },
    { name: 'Courses', path: '/admin/courses' },
    { name: 'Students', path: '/admin/students' },
    { name: 'Instructors', path: '/admin/instructors' }
]

export default function NavbarAdmin() {
    const navigate = useNavigate()

    const [anchorElNotifications, setAnchorElNotifications] = useState(null)
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)
    const [sidebarOpen] = useState(true)

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget)
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
    const handleCloseNavMenu = () => setAnchorElNav(null)
    const handleCloseUserMenu = () => setAnchorElUser(null)

    const user = JSON.parse(localStorage.getItem('profile')) || {}
    const initials = user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U'

    const handleNavigate = (path) => {
        setAnchorElNav(null)
        setAnchorElUser(null)
        setAnchorElNotifications(null)
        navigate(path)
    }

    const handleLogout = () => {
        setAnchorElUser(null)
        localStorage.removeItem('profile')
        localStorage.removeItem('role')
        navigate('/login')
    }

    return (
        <>
            <div
                className="transition-all duration-300"
                style={{
                    marginLeft: sidebarOpen ? '260px' : '72px'
                }}
            >

            </div>
            <AppBar position="sticky" className="bg-white text-slate-800 shadow-sm border-b border-slate-200">
                <Toolbar className="flex justify-between items-center px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <div className="md:hidden">
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                                <MenuIcon />
                            </IconButton>
                            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu} className="md:hidden">
                                {pages.map((page) => (
                                    <MenuItem
                                        key={page}
                                        onClick={() => handleNavigate(page.path)}
                                    >
                                        <Typography textAlign="center">{page.name}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>

                        <Typography variant="h6" noWrap className="font-bold tracking-wide">EduLearn LMS</Typography>
                    </div>

                    <div className="hidden md:flex gap-6 items-center">
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={() => handleNavigate(page.path)}
                                className="text-slate-600 font-medium hover:text-blue-600 transition-colors duration-200"
                            >
                                {page.name}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <IconButton color="inherit" className="text-slate-600 hover:bg-slate-100">
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <IconButton onClick={handleOpenUserMenu} className="p-0">
                            <Avatar alt="Student Profile" src="/avatar.jpg" className="w-9 h-9 border-2 border-blue-500" >
                                {initials || user.firstName?.[0] || 'U'}
                            </Avatar>
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
        </>
    )
}