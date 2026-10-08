import {
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Chip,
    Tabs,
    Tab,
    LinearProgress,
    CircularProgress
} from '@mui/material'
import {
    Assignment as AssignmentIcon,
    Search,
    CalendarToday,
    AccessTime,
    CheckCircle,
    PendingActions,
    Grade,
    UploadFile
} from '@mui/icons-material'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axiosClient'

const statusConfig = {
    upcoming: { label: 'To Do', color: 'warning', icon: <PendingActions fontSize='small' /> },
    submitted: { label: 'Submitted', color: 'info', icon: <CheckCircle fontSize='small' /> },
    graded: { label: 'Graded', color: 'success', icon: <Grade fontSize='small' /> }
}

export default function AssignmentPage() {
    const [tab, setTab] = useState('all')
    const [search, setSearch] = useState('')
    const [course, setCourse] = useState('all')
    const [assignments, setAssignments] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [asgRes, subRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/assignments/submissions')
            ])
            setAssignments(Array.isArray(asgRes.data) ? asgRes.data : [])
            setSubmissions(Array.isArray(subRes.data) ? subRes.data : [])
        } catch (err) {
            console.error('Failed to load assignments:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Match each assignment with current student's submission status
    const combinedAssignments = useMemo(() => {
        return assignments.map(asg => {
            const userSub = submissions.find(
                s => String(s.assignmentId) === String(asg._id) || s.assignmentTitle === asg.title
            )

            let status = 'upcoming'
            let score = null
            let feedback = ''
            let submissionId = null

            if (userSub) {
                status = userSub.status === 'Graded' ? 'graded' : 'submitted'
                score = userSub.score
                feedback = userSub.feedback
                submissionId = userSub._id
            }

            return {
                ...asg,
                status,
                score,
                feedback,
                submissionId
            }
        })
    }, [assignments, submissions])

    const courses = ['all', ...new Set(assignments.map(item => item.course).filter(Boolean))]

    const filteredAssignments = useMemo(() => {
        return combinedAssignments.filter(item => {
            const matchesTab = tab === 'all' || item.status === tab
            const matchesCourse = course === 'all' || item.course === course
            const query = search.trim().toLowerCase()
            const matchesSearch =
                !query ||
                item.title.toLowerCase().includes(query) ||
                item.course.toLowerCase().includes(query)
            return matchesTab && matchesCourse && matchesSearch
        })
    }, [combinedAssignments, tab, search, course])

    const upcomingCount = combinedAssignments.filter(item => item.status === 'upcoming').length
    const submittedCount = combinedAssignments.filter(item => item.status === 'submitted').length
    const gradedCount = combinedAssignments.filter(item => item.status === 'graded').length
    const completedCount = submittedCount + gradedCount
    const completionRate = combinedAssignments.length > 0 ? Math.round((completedCount / combinedAssignments.length) * 100) : 0

    return (
        <>
            <Navbar />
            <Sidebar />
            <div className='min-h-screen bg-slate-50'>
                <main className='ml-0 lg:ml-[260px] transition-all max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Assignments
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View, track, and submit your course assignments.
                            </Typography>
                        </div>
                        <div className='flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm'>
                            <div className='w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                                <AssignmentIcon />
                            </div>
                            <div>
                                <p className='text-xs text-slate-500 m-0'>Completion</p>
                                <p className='text-lg font-bold text-slate-800 m-0'>{completionRate}%</p>
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>To Do</Typography>
                                        <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                            {upcomingCount}
                                        </Typography>
                                    </div>
                                    <div className='w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
                                        <PendingActions />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>Submitted</Typography>
                                        <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                            {submittedCount}
                                        </Typography>
                                    </div>
                                    <div className='w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
                                        <CheckCircle />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>Graded</Typography>
                                        <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                            {gradedCount}
                                        </Typography>
                                    </div>
                                    <div className='w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                                        <Grade />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-0'>
                            <div className='px-5 pt-2 border-b border-slate-200 overflow-x-auto'>
                                <Tabs
                                    value={tab}
                                    onChange={(_, value) => setTab(value)}
                                    variant='scrollable'
                                    scrollButtons='auto'
                                    sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
                                >
                                    <Tab label='All' value='all' />
                                    <Tab label='To Do' value='upcoming' />
                                    <Tab label='Submitted' value='submitted' />
                                    <Tab label='Graded' value='graded' />
                                </Tabs>
                            </div>
                            <div className='p-5 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4'>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='Search assignments or courses...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <Search className='!text-slate-400' />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    size='small'
                                    label='Course'
                                    value={course}
                                    onChange={e => setCourse(e.target.value)}
                                >
                                    {courses.map(item => (
                                        <MenuItem key={item} value={item}>
                                            {item === 'all' ? 'All Courses' : item}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className='py-16 flex justify-center'>
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className='space-y-4'>
                            {filteredAssignments.length > 0 ? (
                                filteredAssignments.map(item => {
                                    const currentStatus = statusConfig[item.status]
                                    return (
                                        <Card
                                            key={item._id}
                                            className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md transition-shadow'
                                        >
                                            <CardContent className='!p-5 sm:!p-6'>
                                                <div className='flex flex-col lg:flex-row lg:items-center gap-5'>
                                                    <div className='w-12 h-12 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
                                                        <AssignmentIcon />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                                            <Chip
                                                                size='small'
                                                                label={item.course}
                                                                className='!bg-slate-100 !text-slate-600 !font-medium'
                                                            />
                                                            <Chip
                                                                size='small'
                                                                icon={currentStatus.icon}
                                                                label={currentStatus.label}
                                                                color={currentStatus.color}
                                                                variant='outlined'
                                                            />
                                                        </div>
                                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                            {item.title}
                                                        </Typography>
                                                        <Typography variant='body2' className='!text-slate-500 !mt-1 !leading-6'>
                                                            {item.description}
                                                        </Typography>
                                                        <div className='flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-slate-500'>
                                                            <div className='flex items-center gap-1.5'>
                                                                <CalendarToday fontSize='small' />
                                                                <span>Due: {item.dueDate}</span>
                                                            </div>
                                                            <div className='font-medium text-slate-600'>
                                                                {item.points} points
                                                            </div>
                                                        </div>
                                                        {item.status === 'graded' && (
                                                            <div className='mt-4 max-w-sm'>
                                                                <div className='flex items-center justify-between mb-1'>
                                                                    <span className='text-xs font-medium text-slate-500'>Score</span>
                                                                    <span className='text-xs font-bold text-emerald-600'>
                                                                        {item.score}/{item.points}
                                                                    </span>
                                                                </div>
                                                                <LinearProgress
                                                                    variant='determinate'
                                                                    value={(item.score / item.points) * 100}
                                                                    className='!h-2 !rounded-full'
                                                                    color='success'
                                                                />
                                                                {item.feedback && (
                                                                    <Typography variant='caption' className='!text-slate-500 !block !mt-1 italic'>
                                                                        Feedback: "{item.feedback}"
                                                                    </Typography>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='lg:ml-auto shrink-0'>
                                                        <Button
                                                            variant={item.status === 'upcoming' ? 'contained' : 'outlined'}
                                                            startIcon={item.status === 'upcoming' ? <UploadFile /> : item.status === 'graded' ? <Grade /> : <CheckCircle />}
                                                            onClick={() => navigate('/student/assignments/details', { state: { assignment: item } })}
                                                            className={
                                                                item.status === 'upcoming'
                                                                    ? '!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                                                    : item.status === 'graded'
                                                                    ? '!normal-case !rounded-lg !border-emerald-300 !text-emerald-700'
                                                                    : '!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                            }
                                                        >
                                                            {item.status === 'upcoming' ? 'Submit Assignment' : item.status === 'graded' ? 'View Grade' : 'View Submission'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            ) : (
                                <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                    <CardContent className='!py-14 !text-center'>
                                        <div className='w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center'>
                                            <AssignmentIcon />
                                        </div>
                                        <Typography variant='h6' className='!font-bold !text-slate-700'>
                                            No assignments found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search or filter.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}