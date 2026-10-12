import RoleScreen from '../../components/StudentScreen'
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
    Tab,
    IconButton
} from '@mui/material'
import {
    RateReviewRounded as RateReviewOutlined,
    CheckCircleRounded as CheckCircleOutlined,
    SearchRounded as Search,
    AddRounded as Add,
    MenuBookRounded as MenuBookOutlined,
    EditRounded as EditOutlined,
    DeleteRounded as DeleteOutline
} from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarInstructor from '../../components/NavbarInstructor'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function InstructorAssignmentsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [courseFilter, setCourseFilter] = useState('All')
    const [courses, setCourses] = useState([])
    const [, setLoading] = useState(false)

    const [assignments, setAssignments] = useState([])
    const [submissions, setSubmissions] = useState([])

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        course: '',
        dueDate: '',
        points: 100,
        description: ''
    })

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingAssignmentId, setEditingAssignmentId] = useState(null)
    const [editForm, setEditForm] = useState({
        title: '',
        course: '',
        dueDate: '',
        points: 100,
        description: ''
    })

    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [gradingModalOpen, setGradingModalOpen] = useState(false)
    const [gradeScore, setGradeScore] = useState('')
    const [gradeFeedback, setGradeFeedback] = useState('')
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const requestFetchData = useCallback(() => {
        return Promise.all([
            api.get('/courses'),
            api.get('/assignments'),
            api.get('/assignments/submissions')
        ]).then(([coursesRes, assignRes, subsRes]) => {
            const loadedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : []
            setCourses(loadedCourses)
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : [])
            setSubmissions(Array.isArray(subsRes.data) ? subsRes.data : [])
            if (loadedCourses.length > 0 && !assignmentForm.course) {
                setAssignmentForm(prev => ({ ...prev, course: loadedCourses[0].courseName }))
            }
        }).catch((err) => {
            console.error('Failed to load database records:', err)
        }).finally(() => {
            setLoading(false)
        })
    }, [assignmentForm.course])

    const fetchData = async () => {
        setLoading(true)
        await requestFetchData()
    }

    useEffect(() => {
        requestFetchData()
    }, [requestFetchData])

    const courseOptions = ['All', ...new Set([...courses.map(c => c.courseName), ...assignments.map(a => a.course)].filter(Boolean))]

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

    const handleOpenEdit = (asg) => {
        setEditingAssignmentId(asg._id)
        setEditForm({
            title: asg.title,
            course: asg.course,
            dueDate: asg.dueDate || '',
            points: asg.points || 100,
            description: asg.description || ''
        })
        setEditDialogOpen(true)
    }

    const handleUpdateAssignment = async (e) => {
        e.preventDefault()
        if (!editForm.title.trim() || !editForm.course) {
            setNotification({ open: true, message: 'Title and course are required', severity: 'error' })
            return
        }
        try {
            await api.put(`/assignments/${editingAssignmentId}`, {
                title: editForm.title.trim(),
                course: editForm.course,
                dueDate: editForm.dueDate || 'No Due Date',
                points: Number(editForm.points) || 100,
                description: editForm.description.trim()
            })
            setEditDialogOpen(false)
            setEditingAssignmentId(null)
            setNotification({ open: true, message: 'Assignment updated successfully!', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to update assignment',
                severity: 'error'
            })
        }
    }

    const handleDeleteAssignment = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This will also remove any student submissions for it.`)) return
        try {
            await api.delete(`/assignments/${id}`)
            setNotification({ open: true, message: 'Assignment deleted successfully', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to delete assignment',
                severity: 'error'
            })
        }
    }

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
                (item.studentName || '').toLowerCase().includes(key) ||
                (item.assignmentTitle || '').toLowerCase().includes(key)
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter
            const matchesCourse = courseFilter === 'All' || item.course === courseFilter
            return matchesSearch && matchesStatus && matchesCourse
        })
    }, [submissions, search, statusFilter, courseFilter])

    const filteredAssignments = useMemo(() => {
        const key = search.toLowerCase()
        return assignments.filter(item => {
            const matchesSearch =
                (item.title || '').toLowerCase().includes(key) ||
                (item.course || '').toLowerCase().includes(key)
            const matchesCourse = courseFilter === 'All' || item.course === courseFilter
            return matchesSearch && matchesCourse
        })
    }, [assignments, search, courseFilter])

    const pendingCount = submissions.filter(s => s.status === 'Pending').length
    const gradedCount = submissions.filter(s => s.status === 'Graded').length

    return (
        <RoleScreen page="instructorassignmentspage" role="instructor">
            <div className='min-h-screen bg-slate-50'>
                <NavbarInstructor sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
                <div
                    className='transition-all duration-300'
                    style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
                >
                    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                        <div className='student-page-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
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

                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
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
                                        slotProps={{ input: { startAdornment: <Search className='!text-slate-400 !mr-2' /> } }}
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
                                            <MenuItem value='All'>All Status</MenuItem>
                                            <MenuItem value='Pending'>Pending Review</MenuItem>
                                            <MenuItem value='Graded'>Graded</MenuItem>
                                        </TextField>
                                    ) : (
                                        <div />
                                    )}
                                </div>

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

                                {activeTab === 1 && (
                                    <div className='overflow-x-auto'>
                                        <table className='w-full min-w-[800px] text-sm'>
                                            <thead className='bg-slate-50 text-slate-500'>
                                                <tr>
                                                    <th className='text-left font-semibold px-6 py-4'>Title</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Course</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Due Date</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Points</th>
                                                    <th className='text-right font-semibold px-6 py-4'>Actions</th>
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
                                                        <td className='px-6 py-4 text-right'>
                                                            <div className='flex justify-end gap-1'>
                                                                <IconButton
                                                                    size='small'
                                                                    color='primary'
                                                                    title='Edit Assignment'
                                                                    onClick={() => handleOpenEdit(asg)}
                                                                >
                                                                    <EditOutlined fontSize='small' />
                                                                </IconButton>
                                                                <IconButton
                                                                    size='small'
                                                                    color='error'
                                                                    title='Delete Assignment'
                                                                    onClick={() => handleDeleteAssignment(asg._id, asg.title)}
                                                                >
                                                                    <DeleteOutline fontSize='small' />
                                                                </IconButton>
                                                            </div>
                                                        </td>
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

              
                <Dialog 
                    open={createDialogOpen} 
                    onClose={() => setCreateDialogOpen(false)} 
                    fullWidth 
                    maxWidth='sm'
                    slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
                >
                    <DialogTitle className='!font-bold !text-slate-800 !pb-2'>
                        Create New Assignment
                    </DialogTitle>
                    <form onSubmit={handleCreateAssignment}>
                        <DialogContent className='!pt-4'>
                            <div className='flex flex-col gap-5 pt-2'>
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
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <TextField
                                        fullWidth
                                        type='date'
                                        label='Due Date'
                                        slotProps={{
                                            inputLabel: { shrink: true }
                                        }}
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
                        <DialogActions className='!px-6 !pb-4 !pt-2'>
                            <Button onClick={() => setCreateDialogOpen(false)} className='!normal-case !text-slate-600'>
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                            >
                                Publish Assignment
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

              
                <Dialog 
                    open={editDialogOpen} 
                    onClose={() => setEditDialogOpen(false)} 
                    fullWidth 
                    maxWidth='sm'
                    slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
                >
                    <DialogTitle className='!font-bold !text-slate-800 !pb-2'>
                        Edit Assignment
                    </DialogTitle>
                    <form onSubmit={handleUpdateAssignment}>
                        <DialogContent className='!pt-4'>
                            <div className='flex flex-col gap-5 pt-2'>
                                <TextField
                                    fullWidth
                                    required
                                    label='Assignment Title'
                                    value={editForm.title}
                                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label='Target Course'
                                    value={editForm.course}
                                    onChange={e => setEditForm(p => ({ ...p, course: e.target.value }))}
                                >
                                    {courses.map(c => (
                                        <MenuItem key={c._id} value={c.courseName}>
                                            {c.courseCode} - {c.courseName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <TextField
                                        fullWidth
                                        type='date'
                                        label='Due Date'
                                        slotProps={{
                                            inputLabel: { shrink: true }
                                        }}
                                        value={editForm.dueDate}
                                        onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))}
                                    />
                                    <TextField
                                        fullWidth
                                        type='number'
                                        label='Max Points'
                                        value={editForm.points}
                                        onChange={e => setEditForm(p => ({ ...p, points: e.target.value }))}
                                    />
                                </div>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label='Instructions & Description'
                                    value={editForm.description}
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-4 !pt-2'>
                            <Button onClick={() => setEditDialogOpen(false)} className='!normal-case !text-slate-600'>
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

               
                <Dialog open={gradingModalOpen} onClose={() => setGradingModalOpen(false)} fullWidth maxWidth='sm'>
                    <DialogTitle className='!font-bold !text-slate-800'>
                        Grade Submission
                    </DialogTitle>
                    <DialogContent>
                        {selectedSubmission && (
                            <div className='flex flex-col gap-4 mt-2 pt-1'>
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
        </RoleScreen>
    )
}