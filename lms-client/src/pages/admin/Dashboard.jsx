import { Card, CardContent, Typography, Button, Chip, Divider } from '@mui/material'
import { People, School, MenuBook, TrendingUp, ArrowForward, MoreVert, CheckCircle, AccessTime, PersonAdd, Assignment, } from '@mui/icons-material'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import { useState } from 'react'

export default function Dashboard() {

    const [sidebarOpen, setSidebarOpen] = useState(true)

    const statistics = [
        {
            title: "Total Students",
            value: "1,267",
            change: "+14.2%",
            description: "from last month",
            icon: <People />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "Total Instructors",
            value: "25",
            change: "+2.2%",
            description: "from last month",
            icon: <School />,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            title: "Total Courses",
            value: "65",
            change: "+7.2%",
            description: "from last month",
            icon: <MenuBook />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            title: "Completion Rate",
            value: "68.3%",
            change: "+7.2%",
            description: "from last month",
            icon: <CheckCircle />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
    ]


    const recentStudents = [
        {
            name: "Maria Reyes",
            value: "maria@example.com",
            course: "Introduction to React",
            date: "Today, 9:30 AM",
            status: "Active"
        },
        {
            name: "Maria Reyes",
            value: "maria@example.com",
            course: "Introduction to React",
            date: "Today, 9:30 AM",
            status: "Active"
        },
        {
            name: "Maria Reyes",
            value: "maria@example.com",
            course: "Introduction to React",
            date: "Today, 9:30 AM",
            status: "Active"
        },
        {
            name: "Maria Reyes",
            value: "maria@example.com",
            course: "Introduction to React",
            date: "Today, 9:30 AM",
            status: "Active"
        },
    ]

    const popularCourses = [
        {
            name: "Introduction to React",
            students: 234,
            progress: 67
        },
        {
            name: "Introduction to React",
            students: 234,
            progress: 67
        },
        {
            name: "Introduction to React",
            students: 234,
            progress: 67
        },
        {
            name: "Introduction to React",
            students: 234,
            progress: 67
        },
    ]

    const activity = [
        {
            title: "New student Registered",
            description: "Maria Reyes joined EduLearn",
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "New student Registered",
            description: "Maria Reyes joined EduLearn",
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "New student Registered",
            description: "Maria Reyes joined EduLearn",
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "New student Registered",
            description: "Maria Reyes joined EduLearn",
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
    ]

    return (
        <>
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
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                            <div>
                                <Typography variant='h4' className='!font-bold !text-slate-800'>
                                    Admin Dashboard
                                </Typography>

                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Welcome back, Admin! Here's what's happening on EduLearn today.
                                </Typography>
                            </div>

                            <div className='flex gap-3'>
                                <Button variant='outlined' startIcon={<People />} className='!border-slate-300 !text-slate-700 !normal-case !rounded-lg'>
                                    Manage Users
                                </Button>

                                <Button variant='contained' startIcon={<MenuBook />} className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'>
                                    Manage Courses
                                </Button>
                            </div>



                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
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

                                                <div className='flex items-center gap-1 mt-2'>
                                                    <TrendingUp className='!text-green-600 !text-base' />
                                                    <span className='text-xs font-semibold text-green-600'>
                                                        {stat.change}
                                                    </span>

                                                    <span className='text-xs text-slate-400'>
                                                        {stat.description}
                                                    </span>
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

                                        <Button endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                            View Details
                                        </Button>

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

                                        <Card elevation={0} className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'>
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

                                        <Card elevation={0} className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'>
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

                                        <Card elevation={0} className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'>
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

                                        <Card elevation={0} className='!rounded-xl !bg-blue-50 hover:!bg-blue-100 !cursor-pointer transition-colors'>
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

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8'>
                                        {activity.map((item, index) => (
                                            <div key={index}>
                                                <div className='flex items-center gap-4 py-4'>
                                                    <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                                                        {item.icon}
                                                    </div>

                                                    <div className='flex-1 min-w-0'>
                                                        <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                            {item.title}
                                                        </Typography>

                                                        <Typography variant='caption' className='!text-slate-500'>
                                                            {item.description}
                                                        </Typography>
                                                    </div>

                                                    <div className='flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap'>
                                                        <AccessTime className='!text-sm' />
                                                        {item.time}
                                                    </div>
                                                </div>

                                                {index < activity.length - 1 && (
                                                    <Divider />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </main >
                </div>
            </div >
        </>

    )
}
