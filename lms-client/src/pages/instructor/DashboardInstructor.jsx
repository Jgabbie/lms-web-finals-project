import { Card, CardContent, Typography, Button, Chip, Divider } from '@mui/material'
import { MenuBook, People, Assignment, RateReview, ArrowForward, AccessTime, CheckCircle, TrendingUp, PersonAdd } from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardInstructor() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()

    const statistics = [
        { title: "My Courses", value: 5, change: '+1', description: 'this semester', icon: <MenuBook />, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { title: "Total Students", value: 125, change: '+8', description: 'this semester', icon: <People />, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
        { title: "Assignments", value: 23, change: '+4', description: 'active tasks', icon: <Assignment />, iconBg: "bg-green-100", iconColor: "text-green-600" },
        { title: "To Grade", value: 12, change: '12 pending', description: 'needs review', icon: <RateReview />, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    ]

    const assignmentsToGrade = [
        { title: 'HTML & CSS Practical Activity', course: 'Web Development', submitted: 28, total: 45, due: 'Oct 6, 2026' },
        { title: 'React State Management Lab', course: 'Web Development', submitted: 32, total: 38, due: 'Oct 9, 2026' },
        { title: 'Database Schema Design', course: 'Database Systems', submitted: 18, total: 40, due: 'Oct 12, 2026' },
    ]

    const upcomingClasses = [
        { subject: 'Web Development', code: 'IT 301', time: '8:00 AM - 10:00 AM', date: 'Monday', room: 'ComLab 3' },
        { subject: 'Database Management', code: 'IT 204', time: '1:00 PM - 3:00 PM', date: 'Wednesday', room: 'ComLab 1' },
    ]

    const popularCourses = [
        { name: 'IT 301 - Web Development', students: 38, progress: 75 },
        { name: 'IT 204 - Database Management', students: 42, progress: 60 },
        { name: 'CS 101 - Intro to Programming', students: 45, progress: 85 },
    ]

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className="transition-all duration-300"
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

                    {/* Stat Cards */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
                        {statistics.map((stat) => (
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

                    {/* Quick Actions & Overview */}
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
                                    <Chip label={`${assignmentsToGrade.length} pending`} size='small' className='!bg-amber-100 !text-amber-700 !font-medium' />
                                </div>
                                <div className='space-y-4'>
                                    {assignmentsToGrade.map((item, index) => {
                                        const progress = Math.round((item.submitted / item.total) * 100)
                                        return (
                                            <div key={index} className='border-b border-slate-100 last:border-0 pb-4 last:pb-0'>
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
                                                    <div className='h-full bg-amber-500 rounded-full' style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        )
                                    })}
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
                                        onClick={() => navigate('/instructor/materials')}
                                        className='!normal-case !justify-start !py-2.5 !rounded-lg !border-slate-200 !text-slate-700 hover:!bg-blue-50 hover:!border-blue-300'
                                    >
                                        Upload Learning Material
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Classes & Popular Courses */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6'>
                                <Typography variant='h6' className='!font-bold !text-slate-800 mb-1'>
                                    Upcoming Classes
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 mb-4'>
                                    Schedule for this week
                                </Typography>
                                <div className='space-y-3'>
                                    {upcomingClasses.map((c, i) => (
                                        <div key={i} className='p-3 rounded-lg border border-slate-100 flex items-center justify-between'>
                                            <div>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {c.subject} ({c.code})
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-500 flex items-center gap-1 mt-0.5'>
                                                    <AccessTime fontSize='inherit' /> {c.date} • {c.time}
                                                </Typography>
                                            </div>
                                            <Chip label={c.room} size='small' className='!bg-blue-50 !text-blue-700 !font-medium' />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6'>
                                <Typography variant='h6' className='!font-bold !text-slate-800 mb-1'>
                                    Enrolled Courses
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 mb-4'>
                                    Student distribution
                                </Typography>
                                <div className='space-y-4'>
                                    {popularCourses.map((c, i) => (
                                        <div key={i}>
                                            <div className='flex justify-between text-sm mb-1'>
                                                <span className='font-semibold text-slate-700'>{c.name}</span>
                                                <span className='text-slate-500'>{c.students} students</span>
                                            </div>
                                            <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden'>
                                                <div className='h-full bg-blue-500 rounded-full' style={{ width: `${c.progress}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    )
}