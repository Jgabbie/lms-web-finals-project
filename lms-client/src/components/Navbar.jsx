import { useState } from "react"
import '../App.css'
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Avatar, Badge, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'


const pages = ['Dashboard', 'My Courses', 'Assignments', 'Grades']

export default function Navbar() {
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget)
    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
    const handleCloseNavMenu = () => setAnchorElNav(null)
    const handleCloseUserMenu = () => setAnchorElUser(null)

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
                                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>

                        <Typography variant="h6" noWrap className="font-bold text-white-600 tracking-wide cursor-pointer">EduLearn LMS</Typography>
                    </div>

                    <div className="hidden md:flex gap-6 items-center">
                        {pages.map((page) => (
                            <Button key={page} onClick={handleCloseNavMenu} className="text-slate-600 font-medium hover:text-blue-600 transition-colors duration-200">
                                {page}
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
                            <Avatar alt="Student Profile" src="/avatar.jpg" className="w-9 h-9 border-2 border-blue-500" />
                        </IconButton>

                        <Menu anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} className="mt-1">
                            <MenuItem onClick={handleCloseUserMenu}>Profile</MenuItem>
                            <MenuItem onClick={handleCloseUserMenu}>Settings</MenuItem>
                            <MenuItem onClick={handleCloseUserMenu} className="text-red-500">Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </>
    )
}