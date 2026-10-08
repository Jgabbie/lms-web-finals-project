import { Card, CardContent, Typography, MenuItem, Chip, TextField, IconButton } from '@mui/material'
import { DeleteOutlined, PeopleOutlined, Search } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function CoursesManagementPage() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('All')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/courses')
            setCourses(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Fetch courses error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return
        try {
            await api.delete(`/courses/${id}`)
            setCourses(prev => prev.filter(c => c._id !== id))
        } catch (error) {
            console.error('Delete course error:', error)
            alert('Failed to delete course')
        }
    }

    const filteredCourses = useMemo(() => {
        const key = search.toLowerCase()
        return courses.filter(course => {
            const name = course.courseName || ''
            const code = course.courseCode || ''
            const instructor = course.instructor || ''
            const matchesSearch =
                name.toLowerCase().includes(key) ||
                code.toLowerCase().includes(key) ||
                instructor.toLowerCase().includes(key)
            const matchesStatus = status === 'All' || course.status === status
            return matchesSearch && matchesStatus
        })
    }, [courses, search, status])

    return (
        <div className='min-h-screen bg-slate-50'>
            <NavbarAdmin />
            <SidebarAdmin open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Course Management
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View, update, and manage your courses.
                            </Typography>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Courses', courses.length],
                            ['Active Courses', courses.filter(item => item.status === 'Active').length],
                            ['Total Enrollments', courses.reduce((sum, item) => sum + (item.enrolledStudents?.length || 0), 0)],
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
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search courses by title or code...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                                <TextField
                                    select
                                    size='small'
                                    label='Status'
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <MenuItem value='All'>All Statuses</MenuItem>
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Archived'>Archived</MenuItem>
                                </TextField>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[900px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Course</th>
                                            <th className='text-left font-semibold px-6 py-4'>Instructor</th>
                                            <th className='text-left font-semibold px-6 py-4'>Semester</th>
                                            <th className='text-left font-semibold px-6 py-4'>Students</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                            <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredCourses.map(course => (<tr key={course._id} className='hover:bg-slate-50'>
                                            <td className='px-6 py-4'>
                                                <Typography className='!font-semibold !text-slate-800'>
                                                    {course.courseName}
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    {course.courseCode}
                                                </Typography>
                                            </td>
                                            <td className='px-6 py-4 text-slate-600'>{course.instructor}</td>
                                            <td className='px-6 py-4 text-slate-600'>{course.semester}</td>
                                            <td className='px-6 py-4'>
                                                <div className='flex items-center gap-1.5 text-slate-600'>
                                                    <PeopleOutlined fontSize='small' />
                                                    {course.enrolledStudents?.length || 0}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4'>
                                                <Chip
                                                    size='small'
                                                    label={course.status || 'Active'}
                                                    className={course.status === 'Active' ? '!bg-green-50 !text-green-700' : '!bg-slate-100 !text-slate-600'}
                                                />
                                            </td>
                                            <td className='px-6 py-4'>
                                                <div className='flex justify-end gap-1'>
                                                    <IconButton size='small' color='error' title='Delete' onClick={() => handleDeleteCourse(course._id)}>
                                                        <DeleteOutlined fontSize='small' />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredCourses.length === 0 && (
                                    <div className='py-12 text-center'>
                                        <Typography className='!font-semibold !text-slate-700'>
                                            {loading ? 'Loading courses...' : 'No courses found'}
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