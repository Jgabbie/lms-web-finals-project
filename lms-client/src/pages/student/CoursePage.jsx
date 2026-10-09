import { Card, CardContent, Typography, TextField, InputAdornment, Chip, MenuItem, CircularProgress } from '@mui/material'
import { Search, MenuBook } from '@mui/icons-material'
import { useState, useEffect, useMemo, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axiosClient'

export default function CoursePage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMyCourses = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/courses/my-courses')
            setCourses(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Failed to fetch enrolled courses:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMyCourses()
    }, [fetchMyCourses])

    const filteredCourses = useMemo(() => {
        const query = search.trim().toLowerCase()
        return courses.filter(course => {
            const matchesSearch = !query ||
                (course.courseName || '').toLowerCase().includes(query) ||
                (course.courseCode || '').toLowerCase().includes(query) ||
                (course.description || '').toLowerCase().includes(query) ||
                (course.instructor || '').toLowerCase().includes(query)
            const matchesStatus = statusFilter === 'All' || course.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [courses, search, statusFilter])

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <Sidebar />
            <main className='ml-0 lg:ml-[260px] transition-all'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Enrolled Courses
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Browse and access your active enrolled courses.
                            </Typography>
                        </div>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-4'>
                            <div className='flex flex-col md:flex-row gap-4'>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='Search your courses...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: (<InputAdornment position='start'><Search className='!text-slate-400' /></InputAdornment>) }}
                                />
                                <TextField
                                    select
                                    size='small'
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                    className='md:!w-48'
                                >
                                    <MenuItem value='All'>All Statuses</MenuItem>
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Archived'>Archived</MenuItem>
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2'>
                            <MenuBook className='!text-blue-600' />
                            <Typography variant='body1' className='!font-semibold !text-slate-700'>
                                My Enrolled Courses
                            </Typography>
                            <span className='text-sm text-slate-400'>
                                ({filteredCourses.length})
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className='py-20 flex justify-center'>
                            <CircularProgress />
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                            {filteredCourses.map((course) => (
                                <Card key={course._id} className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md transition-shadow'>
                                    <div className='h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                                        <MenuBook sx={{ fontSize: 56 }} className='!text-white' />
                                    </div>
                                    <CardContent className='!p-5'>
                                        <div className='flex items-start justify-between gap-3 mb-3'>
                                            <Chip label={course.courseCode} size='small' className='!bg-blue-50 !text-blue-600 !font-medium' />
                                            <Chip label={course.status || 'Active'} size='small' className={course.status === 'Active' ? '!bg-green-50 !text-green-600' : '!bg-slate-100 !text-slate-600'} />
                                        </div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 !mb-2'>
                                            {course.courseName}
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !line-clamp-2 !mb-4'>
                                            {course.description || 'No description provided.'}
                                        </Typography>
                                        <div className='mb-2'>
                                            <Typography variant='caption' className='!text-slate-400'>
                                                Instructor
                                            </Typography>
                                            <Typography variant='body2' className='!font-medium !text-slate-700'>
                                                {course.instructor}
                                            </Typography>
                                        </div>
                                        <div className='flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500'>
                                            <span>{course.schedule || 'Schedule TBA'}</span>
                                            <span>{course.room || 'Room TBA'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!py-16 !text-center'>
                                <MenuBook className='!text-slate-300 !text-5xl mb-3' />
                                <Typography variant='h6' className='!font-semibold !text-slate-700'>
                                    No enrolled courses found
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    You have not been enrolled in any courses yet.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}