import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Tabs,
    Tab
} from '@mui/material'
import {
    AssignmentOutlined,
    RateReviewOutlined,
    CheckCircleOutlined,
    Search,
    Add,
    MenuBookOutlined
} from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function InstructorAssignmentsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [courseFilter, setCourseFilter] = useState('All')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)

    // MongoDB records
    const [assignments, setAssignments] = useState([])
    const [submissions, setSubmissions] = useState([])

    // Dialog state for Creating Assignment
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        course: '',
        dueDate: '',
        points: 100,
        description: ''
    })

    // Dialog state for Grading
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [gradingModalOpen, setGradingModalOpen] = useState(false)
    const [gradeScore, setGradeScore] = useState('')
    const [gradeFeedback, setGradeFeedback] = useState('')
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [coursesRes, assignRes, subsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/assignments'),
                api.get('/assignments/submissions')
            ])

            const loadedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : []
            setCourses(loadedCourses)
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : [])
            setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : [])

            if (loadedCourses.length > 0 && !assignmentForm.course) {
                setAssignmentForm(prev => ({ ...prev, course: loadedCourses[0].courseName }))
            }
        } catch (err) {
            console.error('Failed to load database records:', err)
        } finally {
            setLoading(false)
        }
    }, [assignmentForm.course])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const courseOptions = ['All', ...new Set([...courses.map(c => c.courseName), ...assignments.map(a => a.course)])]

    // Create Assignment Handler
    const handleCreateAssignment = async (e) => {
        e.preventDefault()
        if (!assignmentForm.title.trim() || !assignmentForm.course) {
            setNotification({ open: true, message: 'Please provide assignment title and course', severity: 'error' })
            return
        }

        try {
            await api.post('/assignments/create', {
                title: assignmentForm.title.trim(),
                course: assignmentForm.course,
                dueDate: assignmentForm.dueDate || 'No Due Date',
                points: Number(assignmentForm.points) || 100,
                description: assignmentForm.description.trim()
            })

            setCreateDialogOpen(false)
            setAssignmentForm({
                title: '',
                course: courses[0]?.courseName || '',
                dueDate: '',
                points: 100,
                description: ''
            })
            setNotification({ open: true, message: 'Assignment saved to database!', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to create assignment',
                severity: 'error'
            })
        }
    }

    // Grading Handler
    const handleSaveGrade = async () => {
        if (!selectedSubmission) return

        const scoreNum = Number(gradeScore)
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > selectedSubmission.maxScore) {
            setNotification({
                open: true,
                message: `Please enter a valid score between 0 and ${selectedSubmission.maxScore}`,
                severity: 'error'
            })
            return
        }

        try {
            await api.put(`/assignments/submissions/grade/${selectedSubmission._id}`, {
                score: scoreNum,
                feedback: gradeFeedback.trim()
            })

            setGradingModalOpen(false)
            setSelectedSubmission(null)
            setNotification({ open: true, message: 'Grade recorded in database!', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to record grade',
                severity: 'error'
            })
        }
    }

    const filteredSubmissions = useMemo(() => {
        const key = search.toLowerCase()
        return submissions.filter(item => {
            const matchesSearch =
                item.studentName.toLowerCase().includes(key) ||
                item.assignmentTitle.toLowerCase().includes(key)
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter
            const matchesCourse = courseFilter === 'All' || item.course === courseFilter
            return matchesSearch && matchesStatus && matchesCourse
        })
    }, [submissions, search, statusFilter, courseFilter])

    const filteredAssignments = useMemo(() => {
        const key = search.toLowerCase()
        return assignments.filter(item => {
            const matchesSearch =
                item.title.toLowerCase().includes(key) ||
                item.course.toLowerCase().includes(key)
            const matchesCourse = courseFilter === 'All' || item.course === courseFilter
            return matchesSearch && matchesCourse
        })
    }, [assignments, search, courseFilter])

    const pendingCount = submissions.filter(s => s.status === 'Pending').length
    const gradedCount = submissions.filter(s => s.status === 'Graded').length

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Course Assignments
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Create assignments and evaluate submitted student deliverables.
                            </Typography>
                        </div>
                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={() => setCreateDialogOpen(true)}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Create Assignment
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5 flex items-center justify-between'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-500'>Active Assignments</Typography>
                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>{assignments.length}</Typography>
                                </div>
                                <div className='w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center'>
                                    <MenuBookOutlined />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5 flex items-center justify-between'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-500'>Pending Grading</Typography>
                                    <Typography variant='h4' className='!font-bold !text-amber-600 !mt-1'>{pendingCount}</Typography>
                                </div>
                                <div className='w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center'>
                                    <RateReviewOutlined />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5 flex items-center justify-between'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-500'>Graded Deliverables</Typography>
                                    <Typography variant='h4' className='!font-bold !text-green-600 !mt-1'>{gradedCount}</Typography>
                                </div>
                                <div className='w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center'>
                                    <CheckCircleOutlined />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <div className='border-b border-slate-200 px-4'>
                            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                                <Tab label={`Submissions (${submissions.length})`} className='!normal-case !font-semibold' />
                                <Tab label={`Created Assignments (${assignments.length})`} className='!normal-case !font-semibold' />
                            </Tabs>
                        </div>

                        <CardContent className='!p-0'>
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                                <TextField
                                    select
                                    size='small'
                                    label='Course'
                                    value={courseFilter}
                                    onChange={e => setCourseFilter(e.target.value)}
                                >
                                    {courseOptions.map(c => (
                                        <MenuItem key={c} value={c}>{c === 'All' ? 'All Courses' : c}</MenuItem>
                                    ))}
                                </TextField>
                                {activeTab === 0 ? (
                                    <TextField
                                        select
                                        size='small'
                                        label='Review Status'
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value='All'>All Statuses</MenuItem>
                                        <MenuItem value='Pending'>Pending Review</MenuItem>
                                        <MenuItem value='Graded'>Graded</MenuItem>
                                    </TextField>
                                ) : (
                                    <div />
                                )}
                            </div>

                            {/* TAB 0: Student Submissions Table */}
                            {activeTab === 0 && (
                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[900px] text-sm'>
                                        <thead className='bg-slate-50 text-slate-500'>
                                            <tr>
                                                <th className='text-left font-semibold px-6 py-4'>Student</th>
                                                <th className='text-left font-semibold px-6 py-4'>Assignment</th>
                                                <th className='text-left font-semibold px-6 py-4'>Submission Date</th>
                                                <th className='text-left font-semibold px-6 py-4'>Status</th>
                                                <th className='text-left font-semibold px-6 py-4'>Score</th>
                                                <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100'>
                                            {filteredSubmissions.map(item => (
                                                <tr key={item._id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <Typography className='!font-semibold !text-slate-800'>
                                                            {item.studentName}
                                                        </Typography>
                                                        <Typography variant='caption' className='!text-slate-400'>
                                                            {item.studentEmail}
                                                        </Typography>
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Typography className='!font-medium !text-slate-800'>
                                                            {item.assignmentTitle}
                                                        </Typography>
                                                        <Typography variant='caption' className='!text-slate-500'>
                                                            {item.course}
                                                        </Typography>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-500'>
                                                        {item.submittedAt}
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={item.status}
                                                            className={item.status === 'Graded' ? '!bg-green-50 !text-green-700' : '!bg-amber-50 !text-amber-700'}
                                                        />
                                                    </td>
                                                    <td className='px-6 py-4 font-semibold text-slate-700'>
                                                        {item.score !== null ? `${item.score} / ${item.maxScore}` : '—'}
                                                    </td>
                                                    <td className='px-6 py-4 text-right'>
                                                        <Button
                                                            size='small'
                                                            variant={item.status === 'Graded' ? 'outlined' : 'contained'}
                                                            onClick={() => {
                                                                setSelectedSubmission(item)
                                                                setGradeScore(item.score !== null ? String(item.score) : '')
                                                                setGradeFeedback(item.feedback || '')
                                                                setGradingModalOpen(true)
                                                            }}
                                                            className={
                                                                item.status === 'Graded'
                                                                    ? '!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                                    : '!normal-case !rounded-lg !bg-blue-600 hover:!bg-blue-700 !shadow-none'
                                                            }
                                                        >
                                                            {item.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* TAB 1: Created Assignments List */}
                            {activeTab === 1 && (
                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[800px] text-sm'>
                                        <thead className='bg-slate-50 text-slate-500'>
                                            <tr>
                                                <th className='text-left font-semibold px-6 py-4'>Title</th>
                                                <th className='text-left font-semibold px-6 py-4'>Course</th>
                                                <th className='text-left font-semibold px-6 py-4'>Due Date</th>
                                                <th className='text-left font-semibold px-6 py-4'>Points</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100'>
                                            {filteredAssignments.map(asg => (
                                                <tr key={asg._id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <Typography className='!font-semibold !text-slate-800'>
                                                            {asg.title}
                                                        </Typography>
                                                        <Typography variant='caption' className='!text-slate-500 line-clamp-1'>
                                                            {asg.description}
                                                        </Typography>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>{asg.course}</td>
                                                    <td className='px-6 py-4 text-slate-600'>{asg.dueDate}</td>
                                                    <td className='px-6 py-4 font-semibold text-slate-700'>{asg.points} pts</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* CREATE ASSIGNMENT MODAL */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth='sm'>
                <DialogTitle className='!font-bold !text-slate-800'>
                    Create New Assignment
                </DialogTitle>
                <form onSubmit={handleCreateAssignment}>
                    <DialogContent>
                        <div className='space-y-4 mt-1'>
                            <TextField
                                fullWidth
                                required
                                label='Assignment Title'
                                placeholder='e.g. Activity 3 - RESTful API Design'
                                value={assignmentForm.title}
                                onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))}
                            />
                            <TextField
                                select
                                fullWidth
                                required
                                label='Target Course'
                                value={assignmentForm.course}
                                onChange={e => setAssignmentForm(p => ({ ...p, course: e.target.value }))}
                            >
                                {courses.map(c => (
                                    <MenuItem key={c._id} value={c.courseName}>
                                        {c.courseCode} - {c.courseName}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <div className='grid grid-cols-2 gap-4'>
                                <TextField
                                    fullWidth
                                    type='date'
                                    label='Due Date'
                                    InputLabelProps={{ shrink: true }}
                                    value={assignmentForm.dueDate}
                                    onChange={e => setAssignmentForm(p => ({ ...p, dueDate: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    type='number'
                                    label='Max Points'
                                    value={assignmentForm.points}
                                    onChange={e => setAssignmentForm(p => ({ ...p, points: e.target.value }))}
                                />
                            </div>
                            <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                label='Instructions & Description'
                                placeholder='Specify deliverables, formatting requirements, and deadlines...'
                                value={assignmentForm.description}
                                onChange={e => setAssignmentForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className='!px-6 !pb-5'>
                        <Button onClick={() => setCreateDialogOpen(false)} className='!normal-case !text-slate-600'>
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            variant='contained'
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Publish Assignment
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* GRADING MODAL */}
            <Dialog open={gradingModalOpen} onClose={() => setGradingModalOpen(false)} fullWidth maxWidth='sm'>
                <DialogTitle className='!font-bold !text-slate-800'>
                    Grade Submission
                </DialogTitle>
                <DialogContent>
                    {selectedSubmission && (
                        <div className='space-y-4 mt-2'>
                            <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                                <Typography className='!font-bold !text-slate-800'>
                                    {selectedSubmission.studentName}
                                </Typography>
                                <Typography variant='body2' className='!text-slate-600'>
                                    {selectedSubmission.assignmentTitle} ({selectedSubmission.course})
                                </Typography>
                            </div>
                            <TextField
                                fullWidth
                                label={`Score (Max ${selectedSubmission.maxScore})`}
                                type='number'
                                value={gradeScore}
                                onChange={e => setGradeScore(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label='Feedback'
                                value={gradeFeedback}
                                onChange={e => setGradeFeedback(e.target.value)}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setGradingModalOpen(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleSaveGrade}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Save Grade
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant='filled'>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    )
}