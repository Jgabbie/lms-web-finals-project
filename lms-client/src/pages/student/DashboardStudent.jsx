import { Card, CardContent, Typography, Button, Chip, Divider, LinearProgress } from '@mui/material'
import { MenuBook, TrendingUp, ArrowForward, CheckCircle, AccessTime, PersonAdd, AssignmentTurnedIn, Bookmark, PlayCircle, CalendarMonth, AutoStories } from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { getStoredProfile } from '../../utils/profileStorage'


export default function DashboardStudent() {
    const navigate = useNavigate()
    const profile = getStoredProfile()
    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Student'
    const statistics = [
        {
            title: "Enrolled Courses",
            value: "5",
            detail: "Currently learning",
            icon: <MenuBook />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "Completed Courses",
            value: "2",
            detail: "Great Progress",
            icon: <CheckCircle />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            title: "Assignments",
            value: "8",
            detail: "2 Pending Submission",
            icon: <AssignmentTurnedIn />,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            title: "Overall Progress",
            value: "68%",
            detail: "Across your courses",
            icon: <TrendingUp />,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600"
        },
    ]

    const courses = [
        {
            name: "Introduction to React",
            students: 'Aaaaa',
            progress: 67,
            lessons: '9 of 12 lessons',
            color: 'bg-blue-500'
        },
        {
            name: "Introduction to React",
            students: 'Aaaaa',
            progress: 67,
            lessons: '9 of 12 lessons',
            color: 'bg-blue-500'
        },
        {
            name: "Introduction to React",
            students: 'Aaaaa',
            progress: 67,
            lessons: '9 of 12 lessons',
            color: 'bg-blue-500'
        },
        {
            name: "Introduction to React",
            students: 'Aaaaa',
            progress: 67,
            lessons: '9 of 12 lessons',
            color: 'bg-blue-500'
        },
    ]


    const assignments = [
        {
            title: 'React Components Activity',
            course: 'Introduction to React',
            due: 'Today, 11:59 PM',
            status: 'Due Soon'
        }
    ]


    const activity = [
        {
            title: "Lesson completed",
            description: `${displayName} joined EduLearn`,
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "Lesson completed",
            description: `${displayName} joined EduLearn`,
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "Lesson completed",
            description: `${displayName} joined EduLearn`,
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
        {
            title: "Lesson completed",
            description: `${displayName} joined EduLearn`,
            time: "10 minutes ago",
            icon: <PersonAdd />,
            bg: "bg-blue-100",
            color: "text-blue-600"
        },
    ]

    return (
        <>
            <Navbar />
            <Sidebar />
            <div className="min-h-screen bg-slate-50">
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Student Dashboard
                            </Typography>

                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Welcome back, {displayName}! Here's what's happening on EduLearn today.
                            </Typography>
                        </div>

                        <div className='flex gap-3'>
                            <Button onClick={() => navigate('/student/materials')} variant='outlined' startIcon={<Bookmark />} className='!border-slate-300 !text-slate-700 !normal-case !rounded-lg'>
                                Saved Materials
                            </Button>

                            <Button onClick={() => navigate('/student/courses')} variant='contained' startIcon={<PlayCircle />} className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'>
                                Continue Learning
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

                                            <Typography variant='caption' className='!text-slate-400 !mt-2'>
                                                {stat.detail}
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
                                            My Learning Progress
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-500'>
                                            Pick up where you left off
                                        </Typography>
                                    </div>

                                    <Button onClick={() => navigate('/student/courses')} endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                        View Courses
                                    </Button>

                                </div>


                                <div className='space-y-5'>
                                    {courses.map((course) => (
                                        <div key={course.name} className='border border-slate-100 rounded-xl p-4'>
                                            <div className='flex items-start justify-between gap-3 mb-3'>
                                                <div className='flex items-center gap-3 min-w-0'>
                                                    <div className={`w-11 h-11 rounded-xl ${course.color} text-white flex items-center justify-center shrink-0`}>
                                                        <MenuBook />
                                                    </div>
                                                    <div className='min-w-0'>
                                                        <Typography variant='body1' className='!font-semibold !text-slate-800'>
                                                            {course.name}
                                                        </Typography>
                                                        <Typography variant='caption' className='!text-slate-500'>
                                                            Instructor {course.instructor}
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <span className='text-sm font-semibold text-slate-600'>
                                                    {course.progress}%
                                                </span>
                                            </div>
                                            <LinearProgress variant='determinate' value={course.progress} className='!h-2 !rounded-full' />
                                            <div className='flex justify-between items-center mt-2'>
                                                <span className='text-xs text-slate-400'>{course.lessons}</span>
                                                <Button onClick={() => navigate('/student/courses/details')} size='small' endIcon={<ArrowForward />} className='!normal-case !text-blue-600'>
                                                    Continue
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Upcoming Deadlines
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-500'>
                                            Stay on top of your work
                                        </Typography>
                                    </div>
                                    <CalendarMonth className='!text-slate-400' />
                                </div>

                                <div className='space-y-3'>
                                    {assignments.map((item) => (
                                        <div key={item.title} className='border border-slate-100 p-3'>
                                            <div className='flex items-start justify-between gap-2'>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {item.title}
                                                </Typography>
                                                <Chip
                                                    size='small'
                                                    label={item.status}
                                                    className={item.status === 'Due Soon' ? '!bg-amber-100 !text-amber-700' : '!bg-blue-100 !text-blue-700'}
                                                />
                                            </div>
                                            <Typography variant='caption' className='!text-slate-500'>
                                                {item.course}
                                            </Typography>
                                            <div className='flex items-center gap-1 mt-2 text-xs text-slate-400'>
                                                <AccessTime className='!text-sm' />
                                                Due: {item.due}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Divider className='!my-4' />
                                <Button onClick={() => navigate('/student/assignments')} fullWidth endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                    View Assignment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>


                    <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                        <Card className='xl:col-span-2 !rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6'>

                                <div className='flex items-center justify-between mb-5'>
                                    <div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Recent Activity
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-500'>
                                            Your latest learning updates
                                        </Typography>
                                    </div>

                                    <div>
                                        <Button onClick={() => navigate('/student/discussions')} endIcon={<ArrowForward />} className='!text-blue-600 !normal-case'>
                                            View All
                                        </Button>
                                    </div>
                                </div>

                                {activity.map((item) => (
                                    <div key={item.title} className='flex items-center gap-4 py-4'>
                                        <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${item.bg} ${item.color} `}>
                                            {item.icon}
                                        </div>
                                        <div>
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
                                ))}
                            </CardContent>
                        </Card>


                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className='w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'>
                                        <AutoStories />
                                    </div>

                                    <div>
                                        <Typography variant='h6' className='!font-semibold !text-slate-700'>
                                            Learning Tip
                                        </Typography>

                                        <Typography variant='caption' className='!text-slate-500'>
                                            A little progress each day
                                        </Typography>
                                    </div>
                                </div>

                                <Typography variant='body2' className='!text-slate-600'>
                                    Set aside a short, focused study session every day. Review.
                                </Typography>

                                <Divider className='!my-5' />
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm font-semibold text-slate-700'>Week study goal</span>
                                    <span className='text-sm font-semibold text-blue-600'>4 / 5 hourse</span>
                                </div>
                                <LinearProgress variant='determinate' value={80} className='!h-2 !rounded-full !mt-2' />
                            </CardContent>
                        </Card>
                    </div>
                </main >
            </div >
        </>

    )
}
