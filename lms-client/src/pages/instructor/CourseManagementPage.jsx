import { Card, CardContent, Typography, Button, MenuItem, Chip, TextField, IconButton } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, PeopleOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'

export default function CourseManagementPage() {

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('All')

    const courses = [
        {
            id: 1,
            code: 'IT 301',
            name: 'Web Development',
            instructor: 'Prof. duqwhduiqwd',
            semester: '1st Semester',
            students: 38,
            modules: 8,
            status: 'Active'
        },
        {
            id: 2,
            code: 'IT 301',
            name: 'Web Development',
            instructor: 'Prof. duqwhduiqwd',
            semester: '1st Semester',
            students: 38,
            modules: 8,
            status: 'Active'
        },
        {
            id: 3,
            code: 'IT 301',
            name: 'Web Development',
            instructor: 'Prof. duqwhduiqwd',
            semester: '1st Semester',
            students: 38,
            modules: 8,
            status: 'Active'
        },
    ]

    const filteredCourses = useMemo(() => {
        const key = search.toLowerCase()
        return courses.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(key) ||
                student.code.toLowerCase().includes(key) ||
                student.instructor.toLowerCase().includes(key)

            const matchesProgram =
                status === 'All' || student.status === status

            return matchesSearch && matchesProgram
        })
    }, [search, status])


    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div >
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Course Management
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View, update, and manage LMS courses.
                            </Typography>
                        </div>

                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Create Course
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Courses', courses.length],
                            ['Active Courses', courses.filter(item => item.status === 'Active').length],
                            ['Total Enrollments', courses.reduce((sum, item) => sum + item.students, 0)],
                        ].map(([label, value]) => (
                            <Card
                                key={label}
                                className='!rounded-xl !border !border-slate-200 !shadow-sm'
                            >
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
                                    placeholder='Search courses'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
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
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Course
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Instructor
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Semester
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Students
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Modules
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Status
                                            </th>
                                            <th className='text-right font-semibold px-6 py-4'>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredCourses.map(course => (
                                            <tr key={course.id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <Typography className='!font-semibold !text-slate-500'>
                                                        {course.name}
                                                    </Typography>
                                                    <Typography variant='caption' className='!text-slate-500'>
                                                        {course.code}
                                                    </Typography>
                                                </td>

                                                <td className='px-6 py-4 text-slate-600'>
                                                    {course.instructor}
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>
                                                    {course.semester}
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-1.5 text-slate-600'>
                                                        <PeopleOutlined fontSize='small' />
                                                        {course.students}
                                                    </div>
                                                </td>

                                                <td className='px-6 py-4 text-slate-600'>
                                                    {course.modules}
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={course.status}
                                                        className={
                                                            course.status === 'Active'
                                                                ? '!bg-green-50 !text-green-700'
                                                                : '!bg-slate-100 !text-slate-600'
                                                        }
                                                    />
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <div className='flex justify-end gap-1'>
                                                        <IconButton size='small' title='View'>
                                                            <VisibilityOutlined fontSize='small' />
                                                        </IconButton>
                                                        <IconButton size='small' title='Edit'>
                                                            <EditOutlined fontSize='small' />
                                                        </IconButton>
                                                        <IconButton size='small' color='error' title='Delete'>
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
                                            No courses found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search or status filter
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
