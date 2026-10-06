import { Avatar, Card, CardContent, Typography, Chip, TextField, IconButton } from '@mui/material'
import { DeleteOutlined, Search, PeopleOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function StudentManagementPage() {
    const [search, setSearch] = useState('')
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/user/accounts')
            const allUsers = Array.isArray(res.data) ? res.data : []
            // Filter only students from database
            setStudents(allUsers.filter(u => u.role?.toLowerCase() === 'student'))
        } catch (err) {
            console.error('Failed to fetch students:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

    const filteredStudents = useMemo(() => {
        const key = search.toLowerCase()
        return students.filter(student => {
            const first = student.firstName || ''
            const last = student.lastName || ''
            const email = student.email || ''
            return first.toLowerCase().includes(key) ||
                last.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key)
        })
    }, [students, search])

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Student Directory
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View registered students and their status.
                            </Typography>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Registered Students', students.length],
                            ['Active Accounts', students.filter(item => item.status !== 'inactive').length],
                            ['New Students', students.length],
                        ].map(([label, value]) => (
                            <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-5'>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        {label}
                                    </Typography>
                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                        {value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-0'>
                            <div className='p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    fullWidth
                                    placeholder='Search by name or email...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[700px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Student</th>
                                            <th className='text-left font-semibold px-6 py-4'>Email</th>
                                            <th className='text-left font-semibold px-6 py-4'>Role</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredStudents.map(student => (
                                            <tr key={student._id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <Avatar className='!bg-blue-600 !text-sm'>
                                                            {student.firstName?.charAt(0) || 'S'}
                                                            {student.lastName?.charAt(0) || ''}
                                                        </Avatar>
                                                        <Typography className='!font-semibold !text-slate-800'>
                                                            {student.firstName} {student.lastName}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>{student.email}</td>
                                                <td className='px-6 py-4'>
                                                    <Chip size='small' label='Student' className='!bg-blue-50 !text-blue-700' />
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={student.status || 'Active'}
                                                        className={student.status !== 'inactive' ? '!bg-green-50 !text-green-700' : '!bg-slate-100 !text-slate-600'}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredStudents.length === 0 && (
                                    <div className='py-12 text-center'>
                                        <Typography className='!font-semibold !text-slate-700'>
                                            {loading ? 'Loading...' : 'No students found'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}