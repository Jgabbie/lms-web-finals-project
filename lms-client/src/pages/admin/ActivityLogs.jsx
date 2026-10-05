import { Avatar, Card, CardContent, Typography, IconButton, MenuItem, Chip, TextField, Tooltip } from '@mui/material'
import { AssignmentTurnedInOutlined, DeleteOutlined, EditOutlined, HistoryEduOutlined, HistoryOutlined, LoginOutlined, LogoutOutlined, PersonAddAltOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'

export default function ActivityLogs() {
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('All')
    const [roleFilter, setRoleFilter] = useState('')
    const logs = [
        {
            id: 1,
            user: 'Admin User',
            initials: 'AU',
            role: 'Administrator',
            action: 'Login',
            description: 'Logged in to the LMS admin dashboard',
            date: 'Sep 30, 2026',
            time: '8:42 PM',
            status: 'Success'
        },
        {
            id: 2,
            user: 'Admin User',
            initials: 'AU',
            role: 'Administrator',
            action: 'Login',
            description: 'Logged in to the LMS admin dashboard',
            date: 'Sep 30, 2026',
            time: '8:42 PM',
            status: 'Success'
        },
        {
            id: 3,
            user: 'Admin User',
            initials: 'AU',
            role: 'Administrator',
            action: 'Login',
            description: 'Logged in to the LMS admin dashboard',
            date: 'Sep 30, 2026',
            time: '8:42 PM',
            status: 'Success'
        },
        {
            id: 4,
            user: 'Admin User',
            initials: 'AU',
            role: 'Administrator',
            action: 'Login',
            description: 'Logged in to the LMS admin dashboard',
            date: 'Sep 30, 2026',
            time: '8:42 PM',
            status: 'Success'
        },
    ]

    const filteredLogs = useMemo(() => {
        const key = search.toLowerCase()
        return logs.filter(log => {
            const matchesSearch =
                log.user.toLowerCase().includes(key) ||
                log.description.toLowerCase().includes(key)

            const matchesAction =
                actionFilter === 'All' || log.action === actionFilter
            const matchesRole =
                roleFilter === 'All' || log.role === roleFilter

            return matchesSearch && matchesAction && matchesRole
        })
    }, [search, actionFilter, roleFilter])


    const actionIcon = action => {
        switch (action) {
            case 'Login': return <LoginOutlined fontSize='small' />
            case 'Logout': return <LogoutOutlined fontSize='small' />
            case 'Create': return <PersonAddAltOutlined fontSize='small' />
            case 'Update': return <EditOutlined fontSize='small' />
            case 'Delete': return <DeleteOutlined fontSize='small' />
            case 'Submit': return <AssignmentTurnedInOutlined fontSize='small' />
            case 'Enroll': return <PersonAddAltOutlined fontSize='small' />
            default: return <HistoryEduOutlined fontSize='small' />
        }
    }

    const actionClass = action => {
        switch (action) {
            case 'Login': return '!bg-blue-50 !text-blue-700'
            case 'Logout': return '!bg-slate-100 !text-slate-700'
            case 'Create': return '!bg-green-50 !text-green-700'
            case 'Update': return '!bg-amber-50 !text-amber-700'
            case 'Delete': return '!bg-red-50 !text-red-700'
            case 'Submit': return '!bg-purple-50 !text-purple-700'
            case 'Enroll': return '!bg-cyan-50 !text-cyan-700'
            default: return '!bg-slate-100 !text-slate-700'
        }
    }

    const successful = logs.filter(log => log.status === 'Success').length
    const failed = logs.filter(log => log.status === 'Failed').length
    const usersToday = new Set(logs.filter(log => log.date === 'Sep 30, 2026').map(log => log.user)).size


    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Activity Logs
                        </Typography>
                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Monitor user activity and important actions performed in the LMS
                        </Typography>
                    </div>


                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        {[
                            ['Total Activities', logs.length, 'text-slate-800'],
                            ['Successful', successful, 'text-green-600'],
                            ['Failed', failed, 'text-red-600'],
                            ['Users Today', usersToday, 'text-blue-600'],
                        ].map(([label, value, color]) => (
                            <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-5'>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        {label}
                                    </Typography>
                                    <Typography variant='h4' className={`!font-bold !mt-1 !${color}`}>
                                        {value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>


                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-0'>
                            <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap04 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search user or activity...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
                                />

                                <TextField
                                    select
                                    size='small'
                                    label='Action'
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                >
                                    {['All', 'Login', 'Logout', 'Create', 'Update', 'Delete', 'Enroll', 'Submit'].map(action => (
                                        <MenuItem
                                            key={action}
                                            value={action}
                                        >
                                            {action === 'All' ? 'All Actions' : action}

                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    size='small'
                                    label='Role'
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <MenuItem value='All'>All Roles</MenuItem>
                                    <MenuItem value='Administrator'>Administrator</MenuItem>
                                    <MenuItem value='Instructor'>Instructor</MenuItem>
                                    <MenuItem value='Student'>Student</MenuItem>
                                </TextField>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[900px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>User</th>
                                            <th className='text-left font-semibold px-6 py-4'>Action</th>
                                            <th className='text-left font-semibold px-6 py-4'>Activity</th>
                                            <th className='text-left font-semibold px-6 py-4'>Date & Time</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                            <th className='text-left font-semibold px-6 py-4'>Details</th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredLogs.map(log => (
                                            <tr key={log.id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <Avatar className='!bg-blue-600 !w-10 !h-10 !text-sm'>
                                                            {log.initials}
                                                        </Avatar>

                                                        <div>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {log.user}
                                                            </Typography>
                                                            <Typography variant='caption' className='!text-slate-500'>
                                                                {log.role}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        icon={actionIcon(log.action)}
                                                        label={log.action}
                                                        className={actionClass(log.action)}
                                                    />
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Typography variant='body2' className='!text-slate-600 !max-w-[320px]'>
                                                        {log.description}
                                                    </Typography>
                                                </td>

                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <Typography variant='body2' className='!text-slate-700'>
                                                        {log.date}
                                                    </Typography>
                                                    <Typography variant='caption' className='!text-slate-500'>
                                                        {log.time}
                                                    </Typography>
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={log.status}
                                                        className={
                                                            log.status === 'Success'
                                                                ? '!bg-green-50 !text-green-700'
                                                                : '!bg-red-50 !text-red-700'
                                                        }
                                                    />
                                                </td>

                                                <td className='px-6 py-4 text-right'>
                                                    <Tooltip title='View activity details'>
                                                        <IconButton size='small'>
                                                            <VisibilityOutlined fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredLogs.length === 0 && (
                                    <div className='py-14 text-center'>
                                        <HistoryOutlined className='!text-slate-300 !text-5xl' />
                                        <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                            No activity logs found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search or filters.
                                        </Typography>
                                    </div>
                                )}

                            </div>
                        </CardContent>
                    </Card>
                </main >
            </div >
        </>
    )
}
