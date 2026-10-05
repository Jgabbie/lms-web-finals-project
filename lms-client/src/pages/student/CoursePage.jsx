import { Card, CardContent, Typography, Button, TextField, InputAdornment, Chip, IconButton, MenuItem } from '@mui/material'
import { Search, Add, Edit, Delete, People, MenuBook } from '@mui/icons-material'
import Sidebar from '../../components/Sidebar'


export default function CoursePage() {

    const courses = [
        {
            id: 1,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
        {
            id: 2,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
        {
            id: 3,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
        {
            id: 4,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
        {
            id: 5,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
        {
            id: 6,
            title: 'Introduction to React',
            description: 'Learn the fundamentals of React and build web applications',
            instructor: 'J Smith',
            students: 144,
            status: 'Active',
            category: 'Web Development'
        },
    ]



    return (
        <div className='min-h-screen bg-slate-50'>
            <Sidebar />

            <main className='ml-0 lg:ml-[260px] transition-all'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Courses
                            </Typography>

                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Manage and organize your EduLearn courses
                            </Typography>
                        </div>
                        <Button variant='contained' startIcon={<Add />} className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'>
                            Add Course
                        </Button>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-4'>
                            <div className='flex flex-col md:flex-row gap-4'>
                                <TextField fullWidth size='small' placeholder='Search courses...' InputProps={{ startAdornment: (<InputAdornment position='start'><Search className='!text-slate-400' /></InputAdornment>) }} />
                                <TextField
                                    select
                                    size='small'
                                    defaultValue='All'
                                    className='md:!w-48'
                                >
                                    <MenuItem value='All'>All Courses</MenuItem>
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Inactive'>Inactive</MenuItem>
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2'>
                            <MenuBook className='!text-blue-600' />
                            <Typography variant='body1' className='!font-semibold !text-slate-700'>
                                All Courses
                            </Typography>

                            <span className='text-sm text-slate-400'>
                                ({courses.length})
                            </span>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                        {courses.map((course) => (
                            <Card key={course.id} className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md transition-shadow'>
                                <div className='h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center'>
                                    <MenuBook sx={{ fontSize: 56 }} className='!text-white' />
                                </div>

                                <CardContent className='!p-5'>
                                    <div className='flex items-start justify-between gap-3 mb-3'>
                                        <Chip label={course.category} size='small' className='!bg-blue-50 !text-blue-600 !font-medium' />
                                        <Chip label={course.status} size='small' className={course.status === "Active" ? '!bg-green-50 !text-green-600' : '!bg-amber-50 !text-amber-600'} />
                                    </div>

                                    <Typography variant='h6' className='!font-bold !text-slate-800 !mb-2'>
                                        {course.title}
                                    </Typography>

                                    <Typography variant='body2' className='!text-slate-500 !line-clamp-2 !mb-4'>
                                        {course.description}
                                    </Typography>

                                    <div className='mb-4'>
                                        <Typography variant='caption' className='!text-slate-400'>
                                            Instructor
                                        </Typography>

                                        <Typography variant='body2' className='!font-medium !text-slate-700'>
                                            {course.instructor}
                                        </Typography>
                                    </div>

                                    <div className='flex items-center justify-between pt-4 border-t border-slate-100'>
                                        <div className='flex items-center gap-2 text-slate-500'>
                                            <People fontSize='small' />
                                            <Typography variant='body2' className='!text-slate-500'>
                                                {course.students} students
                                            </Typography>
                                        </div>

                                        <div className='flex items-center'>
                                            <IconButton size='small' className='!text-slate-500 hover:!text-blue-600'>
                                                <Edit fontSize='small' />
                                            </IconButton>

                                            <IconButton size='small' className='!text-slate-500 hover:!text-red-600'>
                                                <Delete fontSize='small' />
                                            </IconButton>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
