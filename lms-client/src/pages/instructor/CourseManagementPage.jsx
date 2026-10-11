import {
    Card,
    CardContent,
    Typography,
    Button,
    MenuItem,
    Chip,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Snackbar,
    Alert
} from '@mui/material'
import { Add, DeleteOutlined, PeopleOutlined, Search, PersonRemoveOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function CourseManagementPage() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('All')
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const navigate = useNavigate()

    // Enrolled Students Modal State
    const [rosterModalOpen, setRosterModalOpen] = useState(false)
    const [selectedCourseForRoster, setSelectedCourseForRoster] = useState(null)
    const [unenrollConfirmOpen, setUnenrollConfirmOpen] = useState(false)
    const [studentToUnenroll, setStudentToUnenroll] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Delete Course Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState(null)

    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/courses')
            setCourses(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Fetch courses error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchCourses()
    }, [fetchCourses])

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return
        try {
            setActionLoading(true)
            await api.delete(`/courses/${courseToDelete._id}`)
            setCourses(prev => prev.filter(c => c._id !== courseToDelete._id))
            setDeleteModalOpen(false)
            setCourseToDelete(null)
            setNotification({ open: true, message: 'Course deleted successfully', severity: 'success' })
        } catch (err) {
            setNotification({ open: true, message: 'Failed to delete course', severity: 'error' })
        } finally {
            setActionLoading(false)
        }
    }

    const handleOpenRoster = (course) => {
        setSelectedCourseForRoster(course)
        setRosterModalOpen(true)
    }

    const handlePromptUnenroll = (student) => {
        setStudentToUnenroll(student)
        setUnenrollConfirmOpen(true)
    }

    const handleConfirmUnenroll = async () => {
        if (!selectedCourseForRoster || !studentToUnenroll) return
        const targetStudentId = studentToUnenroll._id || studentToUnenroll.id || studentToUnenroll

        try {
            setActionLoading(true)
            await api.post('/courses/unenroll', {
                courseId: selectedCourseForRoster._id,
                studentId: targetStudentId
            })

            // Update course state locally
            setSelectedCourseForRoster(prev => ({
                ...prev,
                enrolledStudents: prev.enrolledStudents.filter(
                    s => (s._id || s.id || s) !== targetStudentId
                )
            }))
            setCourses(prev => prev.map(c => {
                if (c._id === selectedCourseForRoster._id) {
                    return {
                        ...c,
                        enrolledStudents: (c.enrolledStudents || []).filter(
                            s => (s._id || s.id || s) !== targetStudentId
                        )
                    }
                }
                return c
            }))

            setUnenrollConfirmOpen(false)
            setStudentToUnenroll(null)
            setNotification({ open: true, message: 'Student removed from course successfully!', severity: 'success' })
        } catch (err) {
            console.error('Unenroll frontend error:', err)
            const errorMsg = err.response?.data?.message || 'Failed to unenroll student'
            setNotification({ open: true, message: errorMsg, severity: 'error' })
        } finally {
            setActionLoading(false)
        }
    }

    const filteredCourses = useMemo(() => {
        const key = search.toLowerCase()
        return courses.filter(course => {
            const name = course.courseName || ''
            const code = course.courseCode || ''
            const instructor = course.instructor || ''
            const matchesSearch =
                name.toLowerCase().includes(key) ||
                code.toLowerCase().includes(key) ||
                instructor.toLowerCase().includes(key)
            const matchesStatus = status === 'All' || course.status === status
            return matchesSearch && matchesStatus
        })
    }, [courses, search, status])

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
                                Course Management
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View courses, manage enrolled students, and update course offerings.
                            </Typography>
                        </div>
                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={() => navigate('/instructor/courses/create')}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Create Course
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Courses', courses.length],
                            ['Active Courses', courses.filter(item => item.status === 'Active').length],
                            ['Total Enrollments', courses.reduce((sum, item) => sum + (item.enrolledStudents?.length || 0), 0)],
                        ].map(([label, value]) => (
                            <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-5'>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        {label}
                                    </Typography>
                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                        {value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-0'>
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search courses by title or code...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                                <TextField
                                    select
                                    size='small'
                                    label='Status'
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <MenuItem value='All'>All Statuses</MenuItem>
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Archived'>Archived</MenuItem>
                                </TextField>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[900px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Course</th>
                                            <th className='text-left font-semibold px-6 py-4'>Instructor</th>
                                            <th className='text-left font-semibold px-6 py-4'>Semester</th>
                                            <th className='text-left font-semibold px-6 py-4'>Enrolled Students</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                            <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredCourses.map(course => (
                                            <tr key={course._id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <Typography className='!font-semibold !text-slate-800'>
                                                        {course.courseName}
                                                    </Typography>
                                                    <Typography variant='caption' className='!text-slate-500'>
                                                        {course.courseCode}
                                                    </Typography>
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>{course.instructor}</td>
                                                <td className='px-6 py-4 text-slate-600'>{course.semester}</td>
                                                <td className='px-6 py-4'>
                                                    <Button
                                                        size='small'
                                                        startIcon={<PeopleOutlined fontSize='small' />}
                                                        onClick={() => handleOpenRoster(course)}
                                                        className='!normal-case !text-blue-600 !bg-blue-50 hover:!bg-blue-100 !rounded-lg !px-3'
                                                    >
                                                        {course.enrolledStudents?.length || 0} Students
                                                    </Button>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={course.status || 'Active'}
                                                        className={course.status === 'Active' ? '!bg-green-50 !text-green-700' : '!bg-slate-100 !text-slate-600'}
                                                    />
                                                </td>
                                                <td className='px-6 py-4 text-right'>
                                                    <IconButton
                                                        size='small'
                                                        color='error'
                                                        title='Delete Course'
                                                        onClick={() => {
                                                            setCourseToDelete(course)
                                                            setDeleteModalOpen(true)
                                                        }}
                                                    >
                                                        <DeleteOutlined fontSize='small' />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredCourses.length === 0 && (
                                    <div className='py-12 text-center'>
                                        <Typography className='!font-semibold !text-slate-700'>
                                            {loading ? 'Loading courses...' : 'No courses found'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* ENROLLED STUDENTS ROSTER MODAL */}
            <Dialog
                open={rosterModalOpen}
                onClose={() => setRosterModalOpen(false)}
                fullWidth
                maxWidth='sm'
                slotProps={{ paper: { className: '!rounded-2xl' } }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Enrolled Students: {selectedCourseForRoster?.courseName} ({selectedCourseForRoster?.courseCode})
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCourseForRoster?.enrolledStudents?.length > 0 ? (
                        <div className='divide-y divide-slate-100'>
                            {selectedCourseForRoster.enrolledStudents.map(student => (
                                <div key={student._id} className='py-3 flex items-center justify-between gap-3'>
                                    <div className='flex items-center gap-3 min-w-0'>
                                        <Avatar className='!bg-blue-600 !text-sm'>
                                            {student.firstName?.charAt(0) || 'S'}
                                            {student.lastName?.charAt(0) || ''}
                                        </Avatar>
                                        <div className='min-w-0'>
                                            <Typography className='!font-semibold !text-slate-800 !text-sm truncate'>
                                                {student.firstName} {student.lastName}
                                            </Typography>
                                            <Typography variant='caption' className='!text-slate-400 truncate block'>
                                                {student.email}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Button
                                        size='small'
                                        color='error'
                                        variant='outlined'
                                        startIcon={<PersonRemoveOutlined fontSize='small' />}
                                        onClick={() => handlePromptUnenroll(student)}
                                        className='!normal-case !rounded-lg !text-xs !border-red-200 !text-red-600 hover:!bg-red-50'
                                    >
                                        Unenroll
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-10 text-center text-slate-500 text-sm'>
                            No students are enrolled in this course yet.
                        </div>
                    )}
                </DialogContent>
                <DialogActions className='!px-6 !py-4'>
                    <Button onClick={() => setRosterModalOpen(false)} className='!normal-case !text-slate-600'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* UNENROLL CONFIRMATION MODAL */}
            <Dialog
                open={unenrollConfirmOpen}
                onClose={() => !actionLoading && setUnenrollConfirmOpen(false)}
                maxWidth='xs'
                fullWidth
                slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Confirm Unenrollment
                </DialogTitle>
                <DialogContent>
                    <Typography className='!text-slate-600 text-sm'>
                        Are you sure you want to unenroll{' '}
                        <span className='font-semibold text-slate-800'>
                            {studentToUnenroll?.firstName} {studentToUnenroll?.lastName}
                        </span>{' '}
                        from this course?
                    </Typography>
                </DialogContent>
                <DialogActions className='!px-4 !pb-3'>
                    <Button
                        onClick={() => setUnenrollConfirmOpen(false)}
                        disabled={actionLoading}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmUnenroll}
                        variant='contained'
                        color='error'
                        disabled={actionLoading}
                        className='!normal-case !rounded-lg !shadow-none'
                    >
                        {actionLoading ? 'Removing...' : 'Unenroll'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DELETE COURSE MODAL */}
            <Dialog
                open={deleteModalOpen}
                onClose={() => !actionLoading && setDeleteModalOpen(false)}
                maxWidth='xs'
                fullWidth
                slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Confirm Delete Course
                </DialogTitle>
                <DialogContent>
                    <Typography className='!text-slate-600 text-sm'>
                        Are you sure you want to delete{' '}
                        <span className='font-semibold text-slate-800'>"{courseToDelete?.courseName}"</span>? This will permanently delete the course and all associated enrollments.
                    </Typography>
                </DialogContent>
                <DialogActions className='!px-4 !pb-3'>
                    <Button
                        onClick={() => setDeleteModalOpen(false)}
                        disabled={actionLoading}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteCourse}
                        variant='contained'
                        color='error'
                        disabled={actionLoading}
                        className='!normal-case !rounded-lg !shadow-none'
                    >
                        {actionLoading ? 'Deleting...' : 'Delete Course'}
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