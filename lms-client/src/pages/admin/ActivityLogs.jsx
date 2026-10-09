import { Avatar, Card, CardContent, Typography, IconButton, MenuItem, Chip, TextField, Tooltip, Button } from '@mui/material'
import { AssignmentTurnedInOutlined, DeleteOutlined, EditOutlined, HistoryEduOutlined, HistoryOutlined, LoginOutlined, LogoutOutlined, PersonAddAltOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function ActivityLogs() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [search, setSearch] = useState('')
    const [actionFilter, setActionFilter] = useState('All')
    const [roleFilter, setRoleFilter] = useState('All')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchLogs = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true)
            }
            setError('')

            const response = await api.get('/logs/logs')
            const data = await response.data

            setLogs(data.logs || [])

        } catch (error) {
            console.error('Error fetching logs:', error)
            setError('Failed to fetch logs. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filteredLogs = useMemo(() => {
        const key = search.toLowerCase()
        return logs.filter(log => {
            const matchesSearch =
                log.user.toLowerCase().includes(key) ||
                log.description.toLowerCase().includes(key)

            const matchesAction =
                actionFilter === 'All' || log.action === actionFilter
            const matchesRole =
                roleFilter === 'All' || log.role?.toLowerCase() === roleFilter.toLowerCase()

            return matchesSearch && matchesAction && matchesRole
        })
    }, [logs, search, actionFilter, roleFilter])


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


            <div className='min-h-screen bg-slate-50'>

                <NavbarAdmin />
                <SidebarAdmin
                    open={sidebarOpen}
                    setOpen={setSidebarOpen}
                />

                <div
                    className='transition-all duration-300'
                    style={{
                        marginLeft: sidebarOpen ? '260px' : '72px'
                    }}
                >
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
                                ['Users', usersToday, 'text-blue-600'],
                            ].map(([label, value, color]) => (
                                <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-5'>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            {label}
                                        </Typography>
                                        <Typography variant='h4' className={`!font-bold !mt-1 ${color}`}>
                                            {value}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>


                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4 p-5 border-b border-slate-200'>
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
                                        fullWidth
                                    >
                                        <MenuItem value='All'>All Roles</MenuItem>
                                        <MenuItem value='Administrator'>Administrator</MenuItem>
                                        <MenuItem value='Instructor'>Instructor</MenuItem>
                                        <MenuItem value='Student'>Student</MenuItem>
                                    </TextField>
                                </div>

                                {loading && (
                                    <div className='py-14 text-center'>
                                        <Typography variant='body' className='!text-slate-500'>
                                            Loading activity logs...
                                        </Typography>
                                    </div>
                                )}

                                {!loading && error && (
                                    <div className='py-14 text-center'>
                                        <HistoryOutlined className='!text-slate-300 !text-5xl' />
                                        <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                            Unable to retrieve activity logs
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            {error}
                                        </Typography>

                                        <Button variant='contained' className='!mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700' onClick={fetchLogs}>
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {!loading && !error && (
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
                                )}
                            </CardContent>
                        </Card>
                    </main >
                </div>
            </div >
        </>
    )
}
