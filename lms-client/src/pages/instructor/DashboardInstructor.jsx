import { Card, CardContent, Typography, Button, Chip, CircularProgress } from '@mui/material'
import { MenuBook, People, Assignment, RateReview, TrendingUp, AccessTime, PersonAdd } from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosClient'

export default function DashboardInstructor() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState([])
    const [students, setStudents] = useState([])
    const [assignments, setAssignments] = useState([])
    const [submissions, setSubmissions] = useState([])
    const navigate = useNavigate()

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true)
            const [coursesRes, usersRes, assignRes, subsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/user/accounts'),
                api.get('/assignments'),
                api.get('/assignments/submissions')
            ])

            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])
            const allUsers = Array.isArray(usersRes.data) ? usersRes.data : []
            setStudents(allUsers.filter(u => u.role?.toLowerCase() === 'student'))
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : [])
            setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : [])
        } catch (err) {
            console.error('Error loading dashboard data:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    // Compute live stats
    const totalCourses = courses.length
    const totalStudents = students.length
    const totalAssignments = assignments.length
    const pendingSubmissions = useMemo(
        () => submissions.filter(s => s.status === 'Pending'),
        [submissions]
    )

    // Compute submissions progress for each active assignment
    const assignmentsToGrade = useMemo(() => {
        return assignments.map(asg => {
            const relatedSubs = submissions.filter(
                s => String(s.assignmentId) === String(asg._id) || s.assignmentTitle === asg.title
            )
            const gradedCount = relatedSubs.filter(s => s.status === 'Graded').length
            return {
                _id: asg._id,
                title: asg.title,
                course: asg.course,
                due: asg.dueDate || 'No Due Date',
                submitted: relatedSubs.length,
                total: totalStudents || relatedSubs.length || 1,
                pending: relatedSubs.length - gradedCount
            }
        })
    }, [assignments, submissions, totalStudents])

    // Courses with class schedules defined
    const upcomingClasses = useMemo(() => {
        return courses.filter(c => c.schedule || c.room)
    }, [courses])

    const statistics = [
        {
            title: 'My Courses',
            value: totalCourses,
            change: `${courses.filter(c => c.status === 'Active').length} Active`,
            description: 'in curriculum',
            icon: <MenuBook />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Total Students',
            value: totalStudents,
            change: `${students.filter(s => s.status !== 'inactive').length} Active`,
            description: 'registered',
            icon: <People />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Assignments',
            value: totalAssignments,
            change: `${assignments.length} Total`,
            description: 'published tasks',
            icon: <Assignment />,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            title: 'To Grade',
            value: pendingSubmissions.length,
            change: `${pendingSubmissions.length} pending`,
            description: 'needs review',
            icon: <RateReview />,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600'
        },
    ]

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {/* Header */}
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Instructor Dashboard
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Welcome back! Here is an overview of your active classes and students.
                            </Typography>
                        </div>
                        <div className='flex gap-3'>
                            <Button
                                variant='outlined'
                                startIcon={<People />}
                                onClick={() => navigate('/instructor/students')}
                                className='!border-slate-300 !text-slate-700 !normal-case !rounded-lg'
                            >
                                Manage Students
                            </Button>
                            <Button
                                variant='contained'
                                startIcon={<MenuBook />}
                                onClick={() => navigate('/instructor/courses')}
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Manage Courses
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className='py-20 flex justify-center items-center'>
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            {/* Stat Cards */}
                            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
                                {statistics.map(stat => (
                                    <Card key={stat.title} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                        <CardContent className='!p-5'>
                                            <div className='flex items-start justify-between'>
                                                <div>
                                                    <Typography variant='body2' className='!text-slate-500'>
                                                        {stat.title}
                                                    </Typography>
                                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                                        {stat.value}
                                                    </Typography>
                                                    <div className='flex items-center gap-1 mt-2'>
                                                        <TrendingUp className='!text-green-600 !text-base' />
                                                        <span className='text-xs font-semibold text-green-600'>{stat.change}</span>
                                                        <span className='text-xs text-slate-400 ml-1'>{stat.description}</span>
                                                    </div>
                                                </div>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                                                    {stat.icon}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                                <Card className='lg:col-span-2 !rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-6'>
                                        <div className='flex items-center justify-between mb-4'>
                                            <div>
                                                <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                    Assignments to Grade
                                                </Typography>
                                                <Typography variant='body2' className='!text-slate-500'>
                                                    Submissions awaiting your review
                                                </Typography>
                                            </div>
                                            <Chip
                                                label={`${pendingSubmissions.length} pending`}
                                                size='small'
                                                className='!bg-amber-100 !text-amber-700 !font-medium'
                                            />
                                        </div>

                                        <div className='space-y-4'>
                                            {assignmentsToGrade.length > 0 ? (
                                                assignmentsToGrade.slice(0, 5).map(item => {
                                                    const progress = Math.min(100, Math.round((item.submitted / item.total) * 100))
                                                    return (
                                                        <div key={item._id} className='border-b border-slate-100 last:border-0 pb-4 last:pb-0'>
                                                            <div className='flex justify-between items-start mb-1'>
                                                                <div>
                                                                    <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                                        {item.title}
                                                                    </Typography>
                                                                    <Typography variant='caption' className='!text-slate-500'>
                                                                        {item.course} • Due {item.due}
                                                                    </Typography>
                                                                </div>
                                                                <span className='text-xs font-semibold text-slate-600'>
                                                                    {item.submitted}/{item.total} submissions
                                                                </span>
                                                            </div>
                                                            <div className='w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden'>
                                                                <div
                                                                    className='h-full bg-amber-500 rounded-full transition-all duration-300'
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className='py-8 text-center text-slate-400 text-sm'>
                                                    No assignments published yet.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Tools */}
                                <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-6'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Quick Actions
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1 !mb-4'>
                                            Common shortcuts
                                        </Typography>
                                        <div className='grid grid-cols-1 gap-3'>
                                            <Button
                                                variant='outlined'
                                                fullWidth
                                                startIcon={<MenuBook />}
                                                onClick={() => navigate('/instructor/courses/create')}
                                                className='!normal-case !justify-start !py-2.5 !rounded-lg !border-slate-200 !text-slate-700 hover:!bg-blue-50 hover:!border-blue-300'
                                            >
                                                Create New Course
                                            </Button>
                                            <Button
                                                variant='outlined'
                                                fullWidth
                                                startIcon={<PersonAdd />}
                                                onClick={() => navigate('/instructor/enroll')}
                                                className='!normal-case !justify-start !py-2.5 !rounded-lg !border-slate-200 !text-slate-700 hover:!bg-blue-50 hover:!border-blue-300'
                                            >
                                                Enroll Students
                                            </Button>
                                            <Button
                                                variant='outlined'
                                                fullWidth
                                                startIcon={<Assignment />}
                                                onClick={() => navigate('/instructor/assignments')}
                                                className='!normal-case !justify-start !py-2.5 !rounded-lg !border-slate-200 !text-slate-700 hover:!bg-blue-50 hover:!border-blue-300'
                                            >
                                                View Assignments
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Classes & Course Distribution */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-6'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 mb-1'>
                                            Course Schedules
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 mb-4'>
                                            Active timetables from your courses
                                        </Typography>
                                        <div className='space-y-3'>
                                            {upcomingClasses.length > 0 ? (
                                                upcomingClasses.map(c => (
                                                    <div key={c._id} className='p-3 rounded-lg border border-slate-100 flex items-center justify-between'>
                                                        <div>
                                                            <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                                {c.courseName} ({c.courseCode})
                                                            </Typography>
                                                            <Typography variant='caption' className='!text-slate-500 flex items-center gap-1 mt-0.5'>
                                                                <AccessTime fontSize='inherit' /> {c.schedule || 'Schedule TBA'}
                                                            </Typography>
                                                        </div>
                                                        <Chip label={c.room || 'TBA'} size='small' className='!bg-blue-50 !text-blue-700 !font-medium' />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className='py-6 text-center text-slate-400 text-sm'>
                                                    No schedule details added yet.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-6'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 mb-1'>
                                            Enrolled Courses
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 mb-4'>
                                            Student distribution per course
                                        </Typography>
                                        <div className='space-y-4'>
                                            {courses.length > 0 ? (
                                                courses.map(c => {
                                                    const enrolledCount = c.enrolledStudents?.length || 0
                                                    const pct = totalStudents > 0 ? Math.round((enrolledCount / totalStudents) * 100) : 0
                                                    return (
                                                        <div key={c._id}>
                                                            <div className='flex justify-between text-sm mb-1'>
                                                                <span className='font-semibold text-slate-700'>
                                                                    {c.courseCode} - {c.courseName}
                                                                </span>
                                                                <span className='text-slate-500'>{enrolledCount} students</span>
                                                            </div>
                                                            <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden'>
                                                                <div
                                                                    className='h-full bg-blue-500 rounded-full transition-all duration-300'
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className='py-6 text-center text-slate-400 text-sm'>
                                                    No courses found in database.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}