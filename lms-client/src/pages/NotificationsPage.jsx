import { Avatar, Badge, Card, CardContent, Typography, Button, Menu, MenuItem, Chip, TextField, IconButton } from '@mui/material'
import { AnnouncementOutlined, AssignmentOutlined, CheckCircleOutlined, DoneAllOutlined, MoreVert, NotificationsNoneOutlined, QuizOutlined, Search, SchoolOutlined, ScheduleOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'

export default function NotificationsPage() {

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedNotifcation, setSelectedNotifcation] = useState(null)

    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'Assignment',
            title: 'New Assignment Posted',
            message: 'A new assignment titled',
            course: 'Web Development',
            time: '10 minutes ago',
            unread: true
        },
        {
            id: 2,
            type: 'Assignment',
            title: 'New Assignment Posted',
            message: 'A new assignment titled',
            course: 'Web Development',
            time: '10 minutes ago',
            unread: true
        },
        {
            id: 3,
            type: 'Assignment',
            title: 'New Assignment Posted',
            message: 'A new assignment titled',
            course: 'Web Development',
            time: '10 minutes ago',
            unread: true
        },
    ])

    const unreadCount = notifications.filter(item => item.unread).length

    const filteredNotifications = useMemo(() => {
        const key = search.toLowerCase()
        return notifications.filter(item => {
            const matchesSearch =
                item.title.toLowerCase().includes(key) ||
                item.message.toLowerCase().includes(key) ||
                item.course.toLowerCase().includes(key)

            const matchesFilter =
                filter === 'All' ||
                (filter === 'Unread' && item.unread) ||
                item.type === filter

            return matchesSearch && matchesFilter
        })
    }, [notifications, search, filter])

    const getNotificationIcon = type => {
        switch (type) {
            case 'Assignment':
                return <AssignmentOutlined />
            case 'Announcement':
                return <AnnouncementOutlined />
            case 'Grade':
                return <CheckCircleOutlined />
            case 'Quiz':
                return <QuizOutlined />
            case 'Schedule':
                return <ScheduleOutlined />
            default:
                return <SchoolOutlined />
        }
    }

    const getIconClass = type => {
        switch (type) {
            case 'Assignment':
                return 'bg-blue-50 text-blue-600'
            case 'Announcement':
                return 'bg-amber-50 text-amber-600'
            case 'Grade':
                return 'bg-green-50 text-green-600'
            case 'Quiz':
                return 'bg-purple-50 text-purple-600'
            case 'Schedule':
                return 'bg-rose-50 text-rose-600'
            default:
                return 'bg-slate-100 text-slate-600'
        }
    }

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(item => ({ ...item, unread: false }))
        )
    }

    const markAsRead = id => {
        setNotifications(prev =>
            prev.map(item =>
                item.id === id ? { ...item, unread: false } : item
            )
        )
    }

    const deleteNotification = id => {
        setNotifications(prev =>
            prev.filter(item => item.id !== id)
        )
        setAnchorEl(null)
        setSelectedNotifcation(null)
    }

    const handleMenuOpen = (e, notification) => {
        setAnchorEl(e.currentTarget)
        setSelectedNotifcation(notification)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        setSelectedNotifcation(null)
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div >
                            <div className='flex items-center gap-3'>
                                <Typography variant='h4' className='!font-bold !text-slate-800'>
                                    Notifications
                                </Typography>

                                {unreadCount > 0 && (
                                    <Chip
                                        size='small'
                                        label={`${unreadCount} unread`}
                                        className='!bg-blue-50 !text-blue-700 !font-semibold'
                                    />
                                )}
                            </div>

                            <Typography variant='body2' className=' !text-slate-500 !mt-1'>
                                Stay updated with your courses, assignments, grades, and announcements
                            </Typography>
                        </div>

                        <Button
                            variant='outlined'
                            startIcon={<DoneAllOutlined />}
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                        >
                            Mark All as read
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                                        <NotificationsNoneOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Total Notifications
                                        </Typography>
                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {notifications.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center'>
                                        <Badge badgeContent={unreadCount} color='error'>
                                            <NotificationsNoneOutlined />
                                        </Badge>
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Unread
                                        </Typography>
                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {unreadCount}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center'>
                                        <DoneAllOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Read
                                        </Typography>
                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {notifications.length - unreadCount}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-4'>
                            <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='Search notifications...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
                                />

                                <div className='flex flex-wrap gap-2 lg:justify-end lg:shrink-0'>
                                    {['All', 'Unread', 'Assignment', 'Announcement', 'Grade', 'Quiz'].map(item => (
                                        <Button
                                            key={item}
                                            size='small'
                                            variant={filter === item ? 'contained' : 'outlined'}
                                            onClick={() => setFilter(item)}
                                            className={
                                                filter === item
                                                    ? '!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                                    : '!normal-case !rounded-lg !border-slate-300 !text-slate-600'
                                            }
                                        >
                                            {item}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-0'>
                            {filteredNotifications.length > 0 ? (
                                <div className='divide-y divide-slate-100'>
                                    {filteredNotifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`relative px-5 sm:px-6 py-5 cursor-pointer transition-colors ${notification.unread
                                                ? 'bg-blue-50/50 hover:bg-blue-50'
                                                : 'bg-white hover:bg-slate-50'
                                                } `}
                                        >
                                            {notification.unread && (
                                                <div className='absolute left-0 top-0 bottom-0 w-1 bg-blue-600' />
                                            )}

                                            <div className='flex items-start gap-4'>
                                                <Avatar className={`!w-11 !h-11 ${getIconClass(notification.type)}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </Avatar>

                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                                                        <div>
                                                            <div className='flex flex-wrap items-center gap-2'>
                                                                <Typography
                                                                    className={`!text-slate-800 ${notification.unread
                                                                        ? '!font-bold'
                                                                        : '!font-semibold'
                                                                        }`}
                                                                >
                                                                    {notification.title}
                                                                </Typography>

                                                                {notification.unread && (
                                                                    <span className='w-2 h-2 rounded-full bg-blue-600' />
                                                                )}
                                                            </div>

                                                            <Typography variant='body2' className='!text-slate-600 !mt-1.5 !leading-6'>
                                                                {notification.message}
                                                            </Typography>
                                                        </div>

                                                        <div className='flex items-center gap-1 shrink-0'>
                                                            <Typography variant='caption' className='!text-slate-400'>
                                                                {notification.time}
                                                            </Typography>

                                                            <IconButton
                                                                size='small'
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    handleMenuOpen(e, notification)
                                                                }}
                                                            >
                                                                <MoreVert fontSize='small' />
                                                            </IconButton>
                                                        </div>
                                                    </div>

                                                    <div className='flex flex-wrap items-center gap-2 mt-3'>
                                                        <Chip
                                                            size='small'
                                                            label={notification.type}
                                                            variant='outlined'
                                                        />

                                                        <Typography variant='caption' className='!text-slate-500'>
                                                            {notification.course}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='py-16 px-6 text-center'>
                                    <div className='w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto'>
                                        <NotificationsNoneOutlined fontSize='large' />
                                    </div>

                                    <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-4'>
                                        No notifications found
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                        Try changing your search or notification filter
                                    </Typography>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main >
            </div >

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {selectedNotifcation?.unread && (
                    <MenuItem
                        onClick={() => {
                            markAsRead(selectedNotifcation.id)
                            handleMenuClose()
                        }}
                    >
                        <DoneAllOutlined fontSize='small' className='!mr-2' />
                        Mark as read
                    </MenuItem>
                )}

                {selectedNotifcation && (
                    <MenuItem
                        onClick={() => {
                            deleteNotification(selectedNotifcation.id)
                        }}
                        className='!text-red-600'
                    >
                        <DoneAllOutlined fontSize='small' className='!mr-2' />
                        Delete Notification
                    </MenuItem>
                )}
            </Menu>
        </>
    )
}
