import { Avatar, Card, CardContent, Typography, Button, Chip, Divider, LinearProgress, Tab, Tabs } from '@mui/material'
import { AnnouncementOutlined, AssignmentOutlined, CalendarTodayOutlined, CheckCircleOutlined, MenuBookOutlined, PersonOutlined, PlayCircleOutlined, Schedule, SchoolOutlined } from '@mui/icons-material'
import { useState } from 'react'
import Navbar from '../../components/Navbar'

export default function CourseDetailsPage() {
    const [tabs, setTabs] = useState(0)

    const modules = [
        {
            id: 1,
            title: 'What is the difference between HTTP and HTTPS',
            lessons: [
                { id: 1, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 2, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 3, title: 'dnqwiudhw', duration: '18 min', completed: true }
            ]
        },
        {
            id: 2,
            title: 'What is the difference between HTTP and HTTPS',
            lessons: [
                { id: 1, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 2, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 3, title: 'dnqwiudhw', duration: '18 min', completed: true }
            ]
        },

        {
            id: 3,
            title: 'What is the difference between HTTP and HTTPS',
            lessons: [
                { id: 1, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 2, title: 'dnqwiudhw', duration: '18 min', completed: true },
                { id: 3, title: 'dnqwiudhw', duration: '18 min', completed: true }
            ]
        },
    ]

    const assignments = [
        {
            id: 1,
            title: 'dqwhdiowqdwd',
            due: 'dwqhdiwqd',
            points: 100,
            status: 'Submitted'
        },
        {
            id: 2,
            title: 'dqwhdiowqdwd',
            due: 'dwqhdiwqd',
            points: 100,
            status: 'Submitted'
        },
        {
            id: 3,
            title: 'dqwhdiowqdwd',
            due: 'dwqhdiwqd',
            points: 100,
            status: 'Submitted'
        },
    ]

    const announcements = [
        {
            id: 1,
            title: 'JDWQIOJDOQWDQW',
            date: 'hdiqwuhduiwqd',
            content: 'idhiqwudhqwuidwq'
        },
        {
            id: 2,
            title: 'JDWQIOJDOQWDQW',
            date: 'hdiqwuhduiwqd',
            content: 'idhiqwudhqwuidwq'
        },
        {
            id: 3,
            title: 'JDWQIOJDOQWDQW',
            date: 'hdiqwuhduiwqd',
            content: 'idhiqwudhqwuidwq'
        },
    ]

    const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0)
    const completedLessons = modules.reduce(
        (sum, module) => sum + module.lessons.filter(lesson => lesson.completed).length, 0
    )

    const progress = Math.round((completedLessons / totalLessons) * 100)


    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <Card className='!rounded-2xl !border !border-slate-200 !shadow-sm !overflow-hidden !mb-6'>
                        <div className='bg-gradient-to-r from-blue-700 to-blue-500 px-6 sm:px-8 py-8 text-white'>
                            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                                <div>
                                    <div className='flex flex-wrap gap-2 mb-4'>
                                        <Chip label='IT 301' size='small' className='!bg-white/20 !text-white' />
                                        <Chip label='3 Units' size='small' className='!bg-white/20 !text-white' />
                                    </div>

                                    <Typography variant='h4' className='!font-bold'>
                                        Web Development
                                    </Typography>

                                    <Typography variant='body2' className='!text-blue-100 !mt-2 !max-w-2xl'>
                                        Learn the fundaments of modern web development using HTML
                                    </Typography>

                                    <div className='flex flex-wrap items-center gap-4 mt-5 text-sm text-blue-100'>
                                        <div className='flex items-center gap-1.5'>
                                            <PersonOutlined fontSize='small' />
                                            Prof. iodjwqiodwq
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <CalendarTodayOutlined fontSize='small' />
                                            Mon / Wed
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <Schedule fontSize='small' />
                                            1:00 PM - 2:30 PM
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-white/10 backdrop-blur-sm rounded-xl p-5 min-w-[250px]'>
                                    <div className='flex items-center justify-between mb-2'>
                                        <Typography variant='body2' className='!text-blue-100'>
                                            Course Progress
                                        </Typography>
                                        <Typography className='!font-bold'>
                                            {progress}%
                                        </Typography>
                                    </div>

                                    <LinearProgress
                                        variant='determinate'
                                        value={progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(255,255,255,0.25)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#fff'
                                            }
                                        }}
                                    />

                                    <Typography variant='caption' className='!block !text-blue-100 !mt-2'>
                                        {completedLessons} of {totalLessons} lessons completed
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                                        <MenuBookOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Modules
                                        </Typography>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            {modules.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center'>
                                        <PlayCircleOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Lessons
                                        </Typography>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            {totalLessons}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center'>
                                        <AssignmentOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Assignments
                                        </Typography>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            {assignments.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center'>
                                        <SchoolOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Semester
                                        </Typography>
                                        <Typography variant='body1' className='!font-bold !text-slate-800'>
                                            1st Sem
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <div className='px-4 sm:px-6 pt-2'>
                            <Tabs
                                value={tabs}
                                onChange={(_, value) => setTabs(value)}
                                variant='scrollable'
                                scrollButtons='auto'
                            >
                                <Tab label='Overview' className='!normal-case !font-semibold' />
                                <Tab label='Modules' className='!normal-case !font-semibold' />
                                <Tab label='Assignments' className='!normal-case !font-semibold' />
                                <Tab label='Announcements' className='!normal-case !font-semibold' />
                            </Tabs>
                        </div>
                    </Card>

                    <Divider />

                    <CardContent className='!p-6'>
                        {tabs === 0 && (
                            <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
                                <div>
                                    <Typography variant='h6' className='!font-bold !text-slate-800 !mb-3'>
                                        About this course
                                    </Typography>
                                    <Typography className='!text-slate-600 !leading-7'>
                                        This course blah blah blah
                                    </Typography>
                                    <Typography variant='h6' className='!font-bold !text-slate-800 !mt-7 !mb-3'>
                                        Learning Objectives
                                    </Typography>

                                    <div className='space-y-3'>
                                        {[
                                            'Buildjqwoidjowqi',
                                            'Buildjqwoidjowqi',
                                            'Buildjqwoidjowqi',
                                            'Buildjqwoidjowqi',
                                        ].map(item => (
                                            <div key={item} className='flex items-start gap-3'>
                                                <CheckCircleOutlined className='!text-green-600 !mt-0.5' />
                                                <Typography variant='body2' className='!text-slate-600'>
                                                    {item}
                                                </Typography>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <Card className='!rounded-xl !border !border-slate-200 !shadow-none !h-fit'>
                                    <CardContent className='!p-5'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Instructor
                                        </Typography>

                                        <div className='flex items-center gap-3 mt-4'>
                                            <Avatar className='!bg-blue-600'>AD</Avatar>
                                            <div>
                                                <Typography className='!font-semibold !text-slate-800'>
                                                    Prof. AD
                                                </Typography>
                                                <Typography variant='body2' className=' !text-slate-500'>
                                                    Course Instructor
                                                </Typography>
                                            </div>
                                        </div>

                                        <Divider className='!my-4' />

                                        <div className='space-y-3'>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    Schedule
                                                </Typography>
                                                <Typography variant='body2' className=' !text-slate-700'>
                                                    Monday & Wednesday
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    Time
                                                </Typography>
                                                <Typography variant='body2' className=' !text-slate-700'>
                                                    1:00 PM - 2:30 PM
                                                </Typography>
                                            </div>

                                            <div>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    Room
                                                </Typography>
                                                <Typography variant='body2' className=' !text-slate-700'>
                                                    Computer Laboratory
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {tabs === 1 && (
                            <div className='space-y-5'>
                                {modules.map(module => (
                                    <Card
                                        key={module.id}
                                        className='!rounded-xl !border !border-slate-200 !shadow-none'
                                    >
                                        <CardContent className='!p-5'>
                                            <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                {module.title}
                                            </Typography>

                                            <div>
                                                {module.lessons.map(
                                                    lesson => {
                                                        <div
                                                            key={lesson.id}
                                                            className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4'
                                                        >
                                                            <div className='flex items-center gap-3'>
                                                                <div
                                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${lesson.completed
                                                                        ? 'bg-green-50 text-green-600'
                                                                        : 'bg-green-100 text-slate-500'
                                                                        }`}
                                                                >
                                                                    {lesson.completed ?
                                                                        (<CheckCircleOutlined fontSize='small' />)
                                                                        :
                                                                        (<PlayCircleOutlined fontSize='small' />)
                                                                    }
                                                                </div>
                                                                <div>
                                                                    <Typography className='!font-medium !text-slate-800'>
                                                                        {lesson.title}
                                                                    </Typography>
                                                                    <Typography variant='caption' className=' !text-slate-500'>
                                                                        {lesson.duration}
                                                                    </Typography>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                size='small'
                                                                variant={lesson.completed ? 'outlined' : 'contained'}
                                                                className={
                                                                    lesson.completed
                                                                        ? '!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                                        : '!normal-case !rounded-lg !bg-blue-600 hover:!bg-blue-700 !shadow-none'
                                                                }
                                                            >
                                                                {lesson.completed ? 'Review' : 'Start Lesson'}
                                                            </Button>
                                                        </div>
                                                    }
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {tabs === 2 && (
                            <div className='space-y-4'>
                                {assignments.map(assignment => (
                                    <Card
                                        key={assignment.id}
                                        className='!rounded-xl !border !border-slate-200 !shadow-none'
                                    >
                                        <CardContent className='!p-5'>
                                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                                                <div>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                            {assignment.title}
                                                        </Typography>

                                                        <Chip
                                                            size='small'
                                                            label={assignment.status}
                                                            className={
                                                                assignment.status === 'Submitted'
                                                                    ? '!bg-green-50 !text-green-700'
                                                                    : '!bg-amber-50 !text-amber-700'
                                                            }
                                                        />
                                                    </div>

                                                    <div className='flex flex-wrap gap-4 mt-2 text-slate-500'>
                                                        <Typography variant='body2'>
                                                            Due: {assignment.due}
                                                        </Typography>
                                                        <Typography variant='body2'>
                                                            {assignment.points} points
                                                        </Typography>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant='outlined'
                                                    className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                >
                                                    View Assignment
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}


                        {tabs === 3 && (
                            <div className='space-y-4'>
                                {announcements.map(announcement => (
                                    <Card
                                        key={announcement.id}
                                        className='!rounded-xl !border !border-slate-200 !shadow-none'
                                    >
                                        <CardContent className='!p-5'>
                                            <div className='flex items-start gap-4'>
                                                <div className='w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0'>
                                                    <AnnouncementOutlined />
                                                </div>
                                                <div>
                                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                        {announcement.title}
                                                    </Typography>

                                                    <Typography variant='caption' className='!text-slate-400'>
                                                        {announcement.date}
                                                    </Typography>

                                                    <Typography variant='body2' className='!text-slate-600 !leading-6 !mt-3'>
                                                        {announcement.content}
                                                    </Typography>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </main >
            </div >
        </>
    )
}
