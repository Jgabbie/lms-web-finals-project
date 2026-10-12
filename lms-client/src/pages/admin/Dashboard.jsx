import RoleScreen from '../../components/StudentScreen'
import { Card, CardContent, Typography, Button, Chip, Divider } from '@mui/material'
import { PeopleRounded as People, SchoolRounded as School, MenuBookRounded as MenuBook, TrendingUpRounded as TrendingUp, ArrowForwardRounded as ArrowForward, MoreVertRounded as MoreVert, CheckCircleRounded as CheckCircle, AccessTimeRounded as AccessTime, PersonAddRounded as PersonAdd, AssignmentRounded as Assignment } from '@mui/icons-material'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosClient'

export default function Dashboard() {

    const [activityLogs, setActivityLogs] = useState([])
    const [loadingActivity, setLoadingActivity] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [, setLoadingStats] = useState(true)
    const [, setStatsError] = useState(null)

    const navigate = useNavigate()
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoadingStats(true)
                setLoadingActivity(true)
                setStatsError(null)

                const [statsResponse, activityResponse] = await Promise.all([
                    api.get('/admin/dashboard-stats'),
                    api.get('/admin/recent-activity-logs')
                ])

                setDashboardData(statsResponse.data)

                const logs = activityResponse.data.logs
                setActivityLogs(Array.isArray(logs) ? logs : [])
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
                setStatsError('Failed to fetch dashboard statistics.')
                setActivityLogs([])
            } finally {
                setLoadingStats(false)
                setLoadingActivity(false)
            }
        }

        fetchDashboardStats()
    }, [])

    const stats = dashboardData?.statistics

    const statistics = [
        {
            title: "Total Students",
            value: stats?.totalStudents ?? "0",
            icon: <People />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "Total Instructors",
            value: stats?.totalInstructors ?? "0",
            icon: <School />,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            title: "Total Courses",
            value: stats?.totalCourses ?? "0",
            icon: <MenuBook />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            title: "Active Students",
            value: stats?.activeStudents ?? "0",
            icon: <CheckCircle />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
    ]

    const getActivityStyle = (action) => {
        switch (action) {
            case 'Login':
                return {
                    icon: <People />,
                    bg: 'bg-blue-100',
                    color: 'text-blue-600'
                }
            case 'Logout':
                return {
                    icon: <AccessTime />,
                    bg: 'bg-slate-100',
                    color: 'text-slate-600'
                }
            case 'Create':
                return {
                    icon: <PersonAdd />,
                    bg: 'bg-green-100',
                    color: 'text-green-600'
                }
            case 'Update':
                return {
                    icon: <Assignment />,
                    bg: 'bg-green-100',
                    color: 'text-green-600'
                }
            case 'Delete':
                return {
                    icon: <MenuBook />,
                    bg: 'bg-green-100',
                    color: 'text-green-600'
                }
            default:
                return {
                    icon: <TrendingUp />,
                    bg: 'bg-slate-100',
                    color: 'text-slate-600'
                }
        }
    }


    const recentStudents = (dashboardData?.recentStudents || []).map(student => ({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        course: student.courseName || "N/A",
        date: new Date(student.createdAt).toLocaleDateString(),
        status: student.status === 'active' ? 'Active' : 'Inactive',
    }))

    const popularCourses = (dashboardData?.popularCourses || []).map(course => ({
        name: course.courseName,
        students: course.enrollmentCount,
        progress: Math.min((course.enrollmentCount / 100) * 100, 100),
    }))

    return (
        <RoleScreen page="dashboard" role="admin">
            <div className="min-h-screen bg-slate-50">
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
                        <div className='student-page-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                            <div>
                                <Typography variant='h4' className='!font-bold !text-slate-800'>
                                    Admin Dashboard
                                </Typography>

                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Welcome back, Admin! Here's what's happening on EduLearn today.
                                </Typography>
                            </div>

                            <div className='flex gap-3'>
                                <Button
                                    variant='outlined'
                                    startIcon={<People />}
                                    onClick={() => navigate('/admin/users')}
                                    className='!border-slate-300 !text-slate-700 !normal-case !rounded-lg'
                                >
                                    Manage Users
                                </Button>

                                <Button
                                    variant='contained'
                                    startIcon={<MenuBook />}
                                    onClick={() => navigate('/admin/courses')}
                                    className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                >
                                    Manage Courses
                                </Button>
                            </div>



                        </div>

                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
                            {statistics.map((stat) => (
                                <Card key={stat.title} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!p-5'>
                                        <div className='flex items-start justify-between'>
                                            <div >
                                                <Typography variant='body2' className='!text-slate-500'>
                                                    {stat.title}
                                                </Typography>

                                                <Typography variant='h5' className='!text-slate-500'>
                                                    {stat.value}
                                                </Typography>

                                            </div>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
                            <Card className='lg:col-span-2 !rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>
                                    <div className='flex items-center justify-between mb-6'>
                                        <div>
                                            <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                Enrollment Overview
                                            </Typography>

                                            <Typography variant='body2' className='!text-slate-500'>
                                                Student enrollment throughout the year
                                            </Typography>
                                        </div>

                                        <div className='h-64 flex items-end gap-3 sm:gap-5 border-b border-slate-200 px-2'>
                                            {[
                                                ["Jan", 45],
                                                ["Feb", 83],
                                                ["Mar", 46],
                                                ["Apr", 45],
                                                ["May", 92],
                                                ["Jun", 34],
                                                ["Jul", 32],
                                                ["Aug", 32],
                                            ].map(([month, value]) => (
                                                <div key={month} className='flex-1 h-full flex flex-col justify-end items-center gap-2'>
                                                    <span className='text-xs font-medium text-slate-500'>
                                                        {Math.round(value * 12)}
                                                    </span>

                                                    <div className='w-full max-w-10 bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all' style={{ height: `${value}%` }} />
                                                    <span className='text-xs text-slate-400'>
                                                        {month}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>
                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                        Quick Actions
                                    </Typography>

                                    <Typography variant='body2' className='!text-slate-500 !mt-1 !mb-5'>
                                        Frequently used admin tools
                                    </Typography>

                                    <div className='grid grid-cols-2 gap-3'>

                                        <Card
                                            elevation={0}
                                            onClick={() => navigate('/admin/users')}
                                            className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'
                                        >
                                            <CardContent className='!p-4'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3'>
                                                    <People />
                                                </div>

                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    Manage Users
                                                </Typography>

                                                <Typography variant='caption' className='!text-slate-500'>
                                                    View and manage users
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            elevation={0}
                                            onClick={() => navigate('/admin/courses')}
                                            className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'
                                        >
                                            <CardContent className='!p-4'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3'>
                                                    <MenuBook />
                                                </div>

                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    Manage Courses
                                                </Typography>

                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Add and manage courses
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            elevation={0}
                                            onClick={() => navigate('/admin/instructors')}
                                            className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'
                                        >
                                            <CardContent className='!p-4'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3'>
                                                    <School />
                                                </div>

                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    Instructors
                                                </Typography>

                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Manage Instructors
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            elevation={0}
                                            onClick={() => navigate('/admin/assignments')}
                                            className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'
                                        >
                                            <CardContent className='!p-4'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-3'>
                                                    <Assignment />
                                                </div>

                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    Assignments
                                                </Typography>

                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Review assignments
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

                            <Card className='xl:col-span-2 !rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>

                                    <div className='flex items-center justify-between mb-5'>
                                        <div>
                                            <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                Recent Students
                                            </Typography>

                                            <Typography variant='body2' className='!text-slate-500'>
                                                Recently registered and active students
                                            </Typography>
                                        </div>

                                        <div>
                                            <Button endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                                View All
                                            </Button>
                                        </div>
                                    </div>

                                    <div className='overflow-x-auto'>
                                        <table className='w-full min-w-[700px]'>
                                            <thead>
                                                <tr className='border-b border-slate-200'>
                                                    <th className='text-left py-3 text-xs font-semibold text-slate-500'>
                                                        Student
                                                    </th>
                                                    <th className='text-left py-3 text-xs font-semibold text-slate-500'>
                                                        Course
                                                    </th>
                                                    <th className='text-left py-3 text-xs font-semibold text-slate-500'>
                                                        Joined
                                                    </th>
                                                    <th className='text-left py-3 text-xs font-semibold text-slate-500'>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {recentStudents.map((student) => (
                                                    <tr key={student.email} className='border-b border-slate-100 last:border-0'>
                                                        <td className='py-4'>
                                                            <div className='flex items-center gap-3'>
                                                                <div className='w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold'>
                                                                    {student.name.charAt(0)}
                                                                </div>

                                                                <div>
                                                                    <div className='text-sm font-semibold text-slate-700'>
                                                                        {student.name}
                                                                    </div>

                                                                    <div className='text-xs text-slate-400'>
                                                                        {student.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className='py-4 text-sm text-slate-600'>
                                                            {student.course}
                                                        </td>

                                                        <td className='py-4 text-sm text-slate-500'>
                                                            {student.date}
                                                        </td>

                                                        <td className='py-4'>
                                                            <Chip label={student.status} size='small' className={student.status === "Active" ? "!bg-green-100 !text-green-700" : "!bg-blue-100 !text-blue-700"} />
                                                        </td>

                                                        <td className='py-4 text-right'>
                                                            <Button size='small' className='!min-w-0 !text-slate-400'>
                                                                <MoreVert />
                                                            </Button>
                                                        </td>

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>


                            <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6'>
                                    <div className='mb-5'>

                                        <div>
                                            <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                Popular Courses
                                            </Typography>

                                            <Typography variant='body2' className='!text-slate-500'>
                                                Most Enrolled Courses
                                            </Typography>
                                        </div>

                                        <div className='overflow-x-auto'>
                                            {popularCourses.map((course, index) => (
                                                <div key={course.name}>
                                                    <div className='flex items-start gap-3'>
                                                        <div className='w-8 h-8 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold'>
                                                            {index + 1}
                                                        </div>
                                                        <div className='flex-1 min-w-0'>
                                                            <div className='flex justify-between gap-2'>
                                                                <span className='text-sm font-semibold text-slate-700 truncate'>
                                                                    {course.name}
                                                                </span>

                                                                <span className='text-xs font-bold text-slate-500'>
                                                                    {course.students}
                                                                </span>
                                                            </div>

                                                            <div className='w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden'>
                                                                <div className='h-full bg-blue-500 rounded-full' style={{ width: `${course.progress}%` }} />
                                                            </div>

                                                            <div className='flex justify-between mt-1'>
                                                                <span className='text-xs text-slate-400'>
                                                                    students
                                                                </span>

                                                                <span className='text-xs font-medium text-slate-500'>
                                                                    {course.progress}% completion
                                                                </span>
                                                            </div>


                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Divider className='!my-5' />

                                        <Button fullWidth endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                            Manage Courses
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm mt-6'>
                            <CardContent className='!p-6'>
                                <div className='mb-5'>
                                    <div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Recent Activity
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-500'>
                                            Latest activity across EduLearn
                                        </Typography>
                                    </div>

                                    {loadingActivity ? (
                                        <Typography variant='body2' className='!text-slate-500 mt-4'>
                                            Loading recent activity logs...
                                        </Typography>
                                    ) : activityLogs.length === 0 ? (
                                        <Typography variant='body2' className='!text-slate-500 mt-4'>
                                            No recent activity logs found.
                                        </Typography>
                                    ) : (
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8'>
                                            {activityLogs.map((item) => {
                                                const style = getActivityStyle(item.action)
                                                return (
                                                    <div key={item.id}>
                                                        <div className='flex items-start gap-4 py-4'>
                                                            <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                                                {style.icon}
                                                            </div>

                                                            <div className='flex-1 min-w-0'>
                                                                <Typography
                                                                    variant='body2'
                                                                    className='!font-semibold !text-slate-800'
                                                                >
                                                                    {item.action}
                                                                    {item.user ? ` - ${item.user}` : ''}
                                                                </Typography>

                                                                <Typography
                                                                    variant='caption'
                                                                    className='!text-slate-500 !mt-1 !break-words'
                                                                >
                                                                    {item.description}
                                                                </Typography>

                                                                <div className='flex flex-wrap items-center gap-2 mt-2'>
                                                                    {item.role && (
                                                                        <Chip
                                                                            label={item.role}
                                                                            size='small'
                                                                            variant='outlined'
                                                                            className='!text-xs !border-slate-200 !text-slate-600'
                                                                        />
                                                                    )}

                                                                    {item.status && (
                                                                        <Chip
                                                                            label={item.status}
                                                                            size='small'
                                                                            className='!text-xs !border-slate-100 !text-slate-600'
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className='flex items-center gap-1 mt-2 text-xs text-slate-400'>
                                                                    <AccessTime className='!text-sm shrink-0' />
                                                                    <span className='break-words'>
                                                                        {item.date}
                                                                        {item.time ? ` at ${item.time}` : ''}
                                                                    </span>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </main >
                </div>
            </div >
        </RoleScreen>

    )
}
