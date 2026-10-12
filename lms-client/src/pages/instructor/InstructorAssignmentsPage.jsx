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
    IconButton,
    Tooltip
} from '@mui/material'
import {
    RateReviewRounded as RateReviewOutlined,
    CheckCircleRounded as CheckCircleOutlined,
    SearchRounded as Search,
    AddRounded as Add,
    MenuBookRounded as MenuBookOutlined,
    EditRounded as EditOutlined,
    DeleteRounded as DeleteOutline,
    AttachFileRounded as AttachFile,
    VisibilityRounded as VisibilityOutlined,
    CheckCircleRounded as CheckCircle
} from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
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
    const [uploading, setUploading] = useState(false)

    const [assignments, setAssignments] = useState([])
    const [submissions, setSubmissions] = useState([])

    // Create Assignment State
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [selectedCreateFile, setSelectedCreateFile] = useState(null)
    const createFileInputRef = useRef(null)
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        course: '',
        dueDate: '',
        points: 100,
        description: ''
    })

    // Edit Assignment State
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingAssignmentId, setEditingAssignmentId] = useState(null)
    const [selectedEditFile, setSelectedEditFile] = useState(null)
    const editFileInputRef = useRef(null)
    const [editForm, setEditForm] = useState({
        title: '',
        course: '',
        dueDate: '',
        points: 100,
        description: '',
        fileName: ''
    })

    // Grading State
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

    // CREATE ASSIGNMENT HANDLER
    const handleCreateAssignment = async (e) => {
        e.preventDefault()
        if (!assignmentForm.title.trim() || !assignmentForm.course) {
            setNotification({ open: true, message: 'Please provide assignment title and course', severity: 'error' })
            return
        }
        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('title', assignmentForm.title.trim())
            formData.append('course', assignmentForm.course)
            formData.append('dueDate', assignmentForm.dueDate || 'No Due Date')
            formData.append('points', Number(assignmentForm.points) || 100)
            formData.append('description', assignmentForm.description.trim())

            if (selectedCreateFile) {
                formData.append('attachment', selectedCreateFile)
            }

            await api.post('/assignments/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setCreateDialogOpen(false)
            setSelectedCreateFile(null)
            if (createFileInputRef.current) createFileInputRef.current.value = ''
            setAssignmentForm({
                title: '',
                course: courses[0]?.courseName || '',
                dueDate: '',
                points: 100,
                description: ''
            })
            setNotification({ open: true, message: 'Assignment published with attachment!', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to create assignment',
                severity: 'error'
            })
        } finally {
            setUploading(false)
        }
    }

    // OPEN EDIT MODAL
    const handleOpenEdit = (asg) => {
        setEditingAssignmentId(asg._id)
        setSelectedEditFile(null)
        setEditForm({
            title: asg.title,
            course: asg.course,
            dueDate: asg.dueDate || '',
            points: asg.points || 100,
            description: asg.description || '',
            fileName: asg.fileName || ''
        })
        setEditDialogOpen(true)
    }

    // UPDATE ASSIGNMENT HANDLER
    const handleUpdateAssignment = async (e) => {
        e.preventDefault()
        if (!editForm.title.trim() || !editForm.course) {
            setNotification({ open: true, message: 'Title and course are required', severity: 'error' })
            return
        }
        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('title', editForm.title.trim())
            formData.append('course', editForm.course)
            formData.append('dueDate', editForm.dueDate || 'No Due Date')
            formData.append('points', Number(editForm.points) || 100)
            formData.append('description', editForm.description.trim())

            if (selectedEditFile) {
                formData.append('attachment', selectedEditFile)
            }

            await api.put(`/assignments/${editingAssignmentId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setEditDialogOpen(false)
            setEditingAssignmentId(null)
            setSelectedEditFile(null)
            setNotification({ open: true, message: 'Assignment updated successfully!', severity: 'success' })
            fetchData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to update assignment',
                severity: 'error'
            })
        } finally {
            setUploading(false)
        }
    }

    // DELETE ASSIGNMENT HANDLER
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

    // GRADE HANDLER
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
                                    Create assignments, attach guidelines, and evaluate student work.
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
                                                                        <div className='flex items-center justify-end gap-2'>
                                                                            {item.fileUrl ? (
                                                                                <Button
                                                                                    size='small'
                                                                                    variant='outlined'
                                                                                    startIcon={<VisibilityOutlined fontSize='small' />}
                                                                                    onClick={() => window.open(item.fileUrl, '_blank', 'noopener,noreferrer')}
                                                                                    className='!normal-case !rounded-lg !border-blue-200 !text-blue-700 !bg-blue-50/50 hover:!bg-blue-50'
                                                                                >
                                                                                    View Work
                                                                                </Button>
                                                                            ) : (
                                                                                <span className='text-xs text-slate-400 italic mr-2'>No File</span>
                                                                            )}

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
                                                                        </div>
                                                                    </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 1 && (
                                    <div className='overflow-x-auto'>
                                        <table className='w-full min-w-[850px] text-sm'>
                                            <thead className='bg-slate-50 text-slate-500'>
                                                <tr>
                                                    <th className='text-left font-semibold px-6 py-4'>Title</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Course</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Due Date</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Points</th>
                                                    <th className='text-left font-semibold px-6 py-4'>Attached File</th>
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
                                                        <td className='px-6 py-4'>
                                                            {asg.fileUrl ? (
                                                                <Button
                                                                    size='small'
                                                                    startIcon={<VisibilityOutlined fontSize='small' />}
                                                                    onClick={() => window.open(asg.fileUrl, '_blank')}
                                                                    className='!normal-case !text-xs !bg-blue-50 hover:!bg-blue-100 !text-blue-700 !rounded-lg'
                                                                >
                                                                    {asg.fileName || 'View Attachment'}
                                                                </Button>
                                                            ) : (
                                                                <span className='text-xs text-slate-400 italic'>None</span>
                                                            )}
                                                        </td>
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

                {/* CREATE ASSIGNMENT MODAL */}
                <Dialog 
                    open={createDialogOpen} 
                    onClose={() => !uploading && setCreateDialogOpen(false)} 
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
                                        slotProps={{ inputLabel: { shrink: true } }}
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
                                {/* ATTACH FILE INPUT */}
                                <Button
                                    component='label'
                                    variant='outlined'
                                    fullWidth
                                    startIcon={<AttachFile />}
                                    className='!normal-case !rounded-xl !border-slate-300 !text-slate-700 !py-3'
                                >
                                    {selectedCreateFile ? selectedCreateFile.name : 'Attach Reference File (Optional)'}
                                    <input
                                        ref={createFileInputRef}
                                        hidden
                                        type='file'
                                        accept='.pdf, .doc, .docx, .ppt, .pptx, .zip, .rar, .png, .jpg, .jpeg'
                                        onChange={e => setSelectedCreateFile(e.target.files?.[0] || null)}
                                    />
                                </Button>
                                {selectedCreateFile && (
                                    <div className='flex items-center gap-2 text-emerald-600 text-sm font-medium'>
                                        <CheckCircle fontSize='small' />
                                        <span>{selectedCreateFile.name} ({(selectedCreateFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-4 !pt-2'>
                            <Button 
                                onClick={() => setCreateDialogOpen(false)} 
                                disabled={uploading} 
                                className='!normal-case !text-slate-600'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                disabled={uploading}
                                className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                            >
                                {uploading ? 'Publishing & Uploading...' : 'Publish Assignment'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* EDIT ASSIGNMENT MODAL */}
                <Dialog 
                    open={editDialogOpen} 
                    onClose={() => !uploading && setEditDialogOpen(false)} 
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
                                        slotProps={{ inputLabel: { shrink: true } }}
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
                                <Button
                                    component='label'
                                    variant='outlined'
                                    fullWidth
                                    startIcon={<AttachFile />}
                                    className='!normal-case !rounded-xl !border-slate-300 !text-slate-700 !py-3'
                                >
                                    {selectedEditFile ? selectedEditFile.name : (editForm.fileName ? `Replace: ${editForm.fileName}` : 'Attach Reference File')}
                                    <input
                                        ref={editFileInputRef}
                                        hidden
                                        type='file'
                                        accept='.pdf, .doc, .docx, .ppt, .pptx, .zip, .rar, .png, .jpg, .jpeg'
                                        onChange={e => setSelectedEditFile(e.target.files?.[0] || null)}
                                    />
                                </Button>
                                {selectedEditFile && (
                                    <div className='flex items-center gap-2 text-emerald-600 text-sm font-medium'>
                                        <CheckCircle fontSize='small' />
                                        <span>{selectedEditFile.name} ({(selectedEditFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-4 !pt-2'>
                            <Button 
                                onClick={() => setEditDialogOpen(false)} 
                                disabled={uploading} 
                                className='!normal-case !text-slate-600'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                disabled={uploading}
                                className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                            >
                                {uploading ? 'Updating...' : 'Save Changes'}
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
                        <div className='flex flex-col gap-4 mt-2 pt-1'>
                            <div className='p-4 bg-slate-50 rounded-xl border border-slate-200'>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <Typography className='!font-bold !text-slate-800'>
                                            {selectedSubmission.studentName}
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-600'>
                                            {selectedSubmission.assignmentTitle} ({selectedSubmission.course})
                                        </Typography>
                                    </div>
                                    {selectedSubmission.fileUrl && (
                                        <Button
                                            size='small'
                                            startIcon={<VisibilityOutlined fontSize='small' />}
                                            onClick={() => window.open(selectedSubmission.fileUrl, '_blank', 'noopener,noreferrer')}
                                            className='!normal-case !text-xs !bg-blue-50 hover:!bg-blue-100 !text-blue-700 !rounded-lg'
                                        >
                                            View Deliverable
                                        </Button>
                                    )}
                                </div>
                                {selectedSubmission.file && (
                                    <Typography variant='caption' className='!text-slate-400 !mt-2 block'>
                                        Attached file: {selectedSubmission.file}
                                    </Typography>
                                )}
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