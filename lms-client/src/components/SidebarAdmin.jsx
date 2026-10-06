
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Button, IconButton, Tooltip } from '@mui/material'
import { Dashboard, People, MenuBook, School, Assignment, Person, Settings, Logout, Menu, ChevronLeft } from '@mui/icons-material'
import { useState } from 'react'

export default function SidebarAdmin() {

    const [open, setOpen] = useState(true)

    const mainMenu = [
        {
            label: 'Dashboard',
            icon: <Dashboard />,
            path: '/admin/dashboard'
        },
        {
            label: 'Users',
            icon: <People />,
            path: '/admin/users'
        },
        {
            label: 'Courses',
            icon: <MenuBook />,
            path: '/admin/courses'
        },
        {
            label: 'Instructors',
            icon: <School />,
            path: '/admin/dashboard'
        },
        {
            label: 'Activity',
            icon: <Assignment />,
            path: '/admin/logs'
        },
    ]

    const accountMenu = [
        {
            label: 'Profile',
            icon: <Person />,
            path: '/admin/profile'
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
                                        component='a'
                                        href={item.path}
                                        selected={item.label === 'Dashboard'}
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
                                                color: item.label === "Dashboard" ? '#2563eb' : "#64748b"
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
                                        component='a'
                                        href={item.path}
                                        selected={item.label === 'Dashboard'}
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
                                                color: "#64748b"
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>

                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTyporgraphyProps={{
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
                            <Avatar className='!bg-blue-600'>
                                A
                            </Avatar>

                            {open && (
                                <div>
                                    <Typography variant='body2' className='!font-semibold !text-slate-700 !truncate'>
                                        Admin User
                                    </Typography>

                                    <Typography variant='caption' className='text-slate-400 !block !truncate'>
                                        Administrator
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
