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
import { GroupAddOutlined, Search, SchoolOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

const DEFAULT_COURSES = [
    { _id: '1', courseCode: 'IT 301', courseName: 'Web Development' },
    { _id: '2', courseCode: 'IT 204', courseName: 'Database Systems' },
    { _id: '3', courseCode: 'CS 101', courseName: 'Intro to OOP' },
]

export default function EnrollStudentPage() {
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [search, setSearch] = useState('')
    const [selectedStudents, setSelectedStudents] = useState([])
    const [students, setStudents] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    // 1. Load active courses (including locally created ones)
    useEffect(() => {
        const storedCourses = JSON.parse(localStorage.getItem('instructor_courses') || '[]')
        const allCourses = [...storedCourses, ...DEFAULT_COURSES]
        setCourses(allCourses)
        if (allCourses.length > 0) {
            setSelectedCourse(allCourses[0].courseCode)
        }
    }, [])

    // 2. Fetch real students from the backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true)
                const res = await api.get('/user/accounts')
                const allUsers = Array.isArray(res.data) ? res.data : []
                setStudents(allUsers.filter(u => u.role?.toLowerCase() === 'student'))
            } catch (err) {
                console.error('Error fetching students:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchStudents()
    }, [])

    // 3. Search filter
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
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    // 4. Enroll action: updates the course's enrolled students list
    const handleEnroll = () => {
        if (!selectedCourse || selectedStudents.length === 0) return

        // Update local storage courses so CourseManagementPage reflects the new enrollment counts
        const storedCourses = JSON.parse(localStorage.getItem('instructor_courses') || '[]')
        const updatedStored = storedCourses.map(c => {
            if (c.courseCode === selectedCourse) {
                const currentEnrolled = c.enrolledStudents || []
                const newEnrolled = Array.from(new Set([...currentEnrolled, ...selectedStudents]))
                return { ...c, enrolledStudents: newEnrolled }
            }
            return c
        })
        localStorage.setItem('instructor_courses', JSON.stringify(updatedStored))

        setNotification({
            open: true,
            message: `Successfully enrolled ${selectedStudents.length} student(s) into ${selectedCourse}!`,
            severity: 'success'
        })
        setSelectedStudents([])
    }

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Enroll Students
                        </Typography>
                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Select a course and enroll registered students.
                        </Typography>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-6'>
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4'>
                                <FormControl fullWidth size='small'>
                                    <InputLabel>Target Course</InputLabel>
                                    <Select
                                        value={selectedCourse}
                                        label='Target Course'
                                        onChange={e => setSelectedCourse(e.target.value)}
                                    >
                                        {courses.map((c) => (
                                            <MenuItem key={c._id || c.courseCode} value={c.courseCode}>
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
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                                <Button
                                    variant='contained'
                                    startIcon={<GroupAddOutlined />}
                                    disabled={!selectedCourse || selectedStudents.length === 0}
                                    onClick={handleEnroll}
                                    className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none !px-6'
                                >
                                    Enroll ({selectedStudents.length})
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
                                    filteredStudents.map(student => (
                                        <div
                                            key={student._id}
                                            onClick={() => toggleStudent(student._id)}
                                            className='flex items-center gap-3 sm:gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors'
                                        >
                                            <Checkbox
                                                checked={selectedStudents.includes(student._id)}
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
                                            <Chip size='small' label={student.status || 'Active'} variant='outlined' />
                                        </div>
                                    ))
                                ) : (
                                    <div className='py-14 px-6 text-center'>
                                        <SchoolOutlined className='!text-slate-300 !text-5xl' />
                                        <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                            {loading ? 'Loading registered students...' : 'No registered students found'}
                                        </Typography>
                                        <Typography variant='caption' className='!text-slate-400 !mt-1 !block'>
                                            Sign up a student account or add one in User Management to see them here.
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
    )
}