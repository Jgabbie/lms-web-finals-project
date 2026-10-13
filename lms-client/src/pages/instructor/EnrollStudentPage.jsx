import RoleScreen from '../../components/StudentScreen'
import {
    Avatar,
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Checkbox,
    Chip,
    TextField,
    Snackbar,
    Alert
} from '@mui/material'
import { GroupAddRounded as GroupAddOutlined, SearchRounded as Search, SchoolRounded as SchoolOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarInstructor from '../../components/NavbarInstructor'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function EnrollStudentPage() {
    const [courses, setCourses] = useState([])
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [search, setSearch] = useState('')
    const [selectedStudents, setSelectedStudents] = useState([])
    const [students, setStudents] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [coursesRes, usersRes] = await Promise.all([
                api.get('/courses'),
                api.get('/user/accounts')
            ])

            const loadedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : []
            setCourses(loadedCourses)

            if (loadedCourses.length > 0 && !selectedCourseId) {
                setSelectedCourseId(loadedCourses[0]._id)
            }

            const allUsers = Array.isArray(usersRes.data) ? usersRes.data : []
            setStudents(allUsers.filter(u => u.role?.toLowerCase() === 'student'))
        } catch (err) {
            console.error('Error loading enrollment data:', err)
        } finally {
            setLoading(false)
        }
    }, [selectedCourseId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const currentCourse = useMemo(() => {
        return courses.find(c => c._id === selectedCourseId)
    }, [courses, selectedCourseId])

    const isStudentEnrolled = useCallback((studentId) => {
        if (!currentCourse || !currentCourse.enrolledStudents) return false
        return currentCourse.enrolledStudents.some(item => {
            const enrolledId = typeof item === 'object' && item !== null ? (item._id || item.id) : item
            return String(enrolledId) === String(studentId)
        })
    }, [currentCourse])

    const filteredStudents = useMemo(() => {
        const key = search.toLowerCase()
        return students.filter(student => {
            const first = student.firstName || ''
            const last = student.lastName || ''
            const email = student.email || ''
            return first.toLowerCase().includes(key) ||
                last.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key)
        })
    }, [students, search])

    const toggleStudent = (id) => {
        if (isStudentEnrolled(id)) return
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const handleCourseChange = (newCourseId) => {
        setSelectedCourseId(newCourseId)
        setSelectedStudents([])
    }

    const handleEnroll = async () => {
        if (!selectedCourseId || selectedStudents.length === 0) return
        try {
            setEnrolling(true)
            await api.post('/courses/enroll', {
                courseId: selectedCourseId,
                studentIds: selectedStudents
            })
            setNotification({
                open: true,
                message: `Successfully enrolled ${selectedStudents.length} student(s)!`,
                severity: 'success'
            })
            setSelectedStudents([])
            loadData()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to enroll students',
                severity: 'error'
            })
        } finally {
            setEnrolling(false)
        }
    }

    return (
        <RoleScreen page="enrollstudentpage" role="instructor">
            <div className='min-h-screen bg-slate-50'>
                <NavbarInstructor sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
                <div
                    className='transition-all duration-300'
                    style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
                >
                    <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                        <div className='student-page-heading mb-7'>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Enroll Students
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Select a course and enroll eligible registered students.
                            </Typography>
                        </div>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                            <CardContent className='!p-6'>
                                <div className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4'>
                                    <FormControl fullWidth size='small'>
                                        <InputLabel>Target Course</InputLabel>
                                        <Select
                                            value={selectedCourseId}
                                            label='Target Course'
                                            onChange={e => handleCourseChange(e.target.value)}
                                        >
                                            {courses.map(c => (
                                                <MenuItem key={c._id} value={c._id}>
                                                    {c.courseCode} - {c.courseName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        size='small'
                                        placeholder='Search students by name or email...'
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        slotProps={{ input: { startAdornment: <Search className='!text-slate-400 !mr-2' /> } }}
                                    />
                                    <Button
                                        variant='contained'
                                        startIcon={<GroupAddOutlined />}
                                        disabled={!selectedCourseId || selectedStudents.length === 0 || enrolling}
                                        onClick={handleEnroll}
                                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none !px-6'
                                    >
                                        {enrolling ? 'Enrolling...' : `Enroll (${selectedStudents.length})`}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-200'>
                                    <div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Registered Students
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            {filteredStudents.length} student(s) available
                                        </Typography>
                                    </div>
                                    <Chip
                                        icon={<SchoolOutlined />}
                                        label={`${selectedStudents.length} selected`}
                                        className='!bg-blue-50 !text-blue-700 !font-medium'
                                    />
                                </div>
                                <div className='divide-y divide-slate-100'>
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => {
                                            const alreadyEnrolled = isStudentEnrolled(student._id)
                                            const isChecked = selectedStudents.includes(student._id)
                                            return (
                                                <div
                                                    key={student._id}
                                                    onClick={() => toggleStudent(student._id)}
                                                    className={`flex items-center gap-3 sm:gap-4 px-6 py-4 transition-colors ${alreadyEnrolled
                                                            ? 'bg-slate-50/70 cursor-not-allowed opacity-75'
                                                            : 'hover:bg-slate-50 cursor-pointer'
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={alreadyEnrolled || isChecked}
                                                        disabled={alreadyEnrolled}
                                                        onChange={() => toggleStudent(student._id)}
                                                    />
                                                    <Avatar className='!bg-blue-600 !text-sm'>
                                                        {student.firstName?.charAt(0) || 'S'}
                                                        {student.lastName?.charAt(0) || ''}
                                                    </Avatar>
                                                    <div className='flex-1 min-w-0'>
                                                        <Typography className='!font-semibold !text-slate-800'>
                                                            {student.firstName} {student.lastName}
                                                        </Typography>
                                                        <Typography variant='caption' className='!text-slate-400 break-all'>
                                                            {student.email}
                                                        </Typography>
                                                    </div>
                                                    {alreadyEnrolled ? (
                                                        <Chip
                                                            size='small'
                                                            label='Already Enrolled'
                                                            className='!bg-green-100 !text-green-800 !font-semibold'
                                                        />
                                                    ) : (
                                                        <Chip
                                                            size='small'
                                                            label={student.status || 'Active'}
                                                            variant='outlined'
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className='py-14 px-6 text-center'>
                                            <SchoolOutlined className='!text-slate-300 !text-5xl' />
                                            <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                                {loading ? 'Loading registered students...' : 'No registered students found'}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
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