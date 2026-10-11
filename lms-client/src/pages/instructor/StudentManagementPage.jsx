import RoleScreen from '../../components/StudentScreen'
import {
    Avatar,
    Card,
    CardContent,
    Typography,
    Chip,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material'
import { Search, MenuBookOutlined, EmailOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function StudentManagementPage() {
    const [search, setSearch] = useState('')
    const [students, setStudents] = useState([])
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    // Modal state for student course details
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)

    const fetchData = useCallback(() => {
        return Promise.all([
                api.get('/user/accounts'),
                api.get('/courses')
            ]).then(async ([usersRes, coursesRes]) => {
            const allUsers = Array.isArray(usersRes.data) ? usersRes.data : []
            setStudents(allUsers.filter(u => u.role?.toLowerCase() === 'student'))
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])

        }).catch((err) => {
            console.error('Failed to fetch students or courses:', err)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Get courses that this student is enrolled in
    const getStudentCourses = useCallback((studentId) => {
        return courses.filter(course =>
            (course.enrolledStudents || []).some(item => {
                const id = typeof item === 'object' && item !== null ? (item._id || item.id) : item
                return String(id) === String(studentId)
            })
        )
    }, [courses])

    const handleOpenDetails = (student) => {
        setSelectedStudent(student)
        setDetailsModalOpen(true)
    }

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

    const activeEnrolledCount = useMemo(() => {
        return students.filter(s => getStudentCourses(s._id).length > 0).length
    }, [students, getStudentCourses])

    const studentEnrolledCourses = useMemo(() => {
        if (!selectedStudent) return []
        return getStudentCourses(selectedStudent._id)
    }, [selectedStudent, getStudentCourses])

    return (
        <RoleScreen page="studentmanagementpage" role="instructor">
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='student-page-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Student Directory
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View registered students and inspect their active enrolled courses.
                            </Typography>
                        </div>
                    </div>

                    <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Registered Students', students.length],
                            ['Students Enrolled in Courses', activeEnrolledCount],
                            ['Active Accounts', students.filter(item => item.status !== 'inactive').length],
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
                            <div className='p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    fullWidth
                                    placeholder='Search by name or email...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    slotProps={{ input: { startAdornment: <Search className='!text-slate-400 !mr-2' /> } }}
                                />
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[850px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Student</th>
                                            <th className='text-left font-semibold px-6 py-4'>Email</th>
                                            <th className='text-left font-semibold px-6 py-4'>Enrolled Courses</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                            <th className='text-right font-semibold px-6 py-4'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredStudents.map(student => {
                                            const enrolledList = getStudentCourses(student._id)
                                            return (
                                                <tr key={student._id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <Avatar className='!bg-blue-600 !text-sm'>
                                                                {student.firstName?.charAt(0) || 'S'}
                                                                {student.lastName?.charAt(0) || ''}
                                                            </Avatar>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {student.firstName} {student.lastName}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>{student.email}</td>
                                                    <td className='px-6 py-4'>
                                                        {enrolledList.length > 0 ? (
                                                            <div className='flex flex-wrap gap-1'>
                                                                {enrolledList.slice(0, 2).map(c => (
                                                                    <Chip
                                                                        key={c._id}
                                                                        size='small'
                                                                        label={c.courseCode}
                                                                        className='!bg-blue-50 !text-blue-700 !font-medium'
                                                                    />
                                                                ))}
                                                                {enrolledList.length > 2 && (
                                                                    <Chip
                                                                        size='small'
                                                                        label={`+${enrolledList.length - 2} more`}
                                                                        className='!bg-slate-100 !text-slate-600'
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className='text-xs text-slate-400 italic'>None enrolled</span>
                                                        )}
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={student.status || 'Active'}
                                                            className={student.status !== 'inactive' ? '!bg-green-50 !text-green-700' : '!bg-slate-100 !text-slate-600'}
                                                        />
                                                    </td>
                                                    <td className='px-6 py-4 text-right'>
                                                        <Button
                                                            size='small'
                                                            variant='outlined'
                                                            onClick={() => handleOpenDetails(student)}
                                                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                        >
                                                            View Details
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                                {filteredStudents.length === 0 && (
                                    <div className='py-12 text-center'>
                                        <Typography className='!font-semibold !text-slate-700'>
                                            {loading ? 'Loading...' : 'No students found'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* STUDENT DETAILS & ENROLLED COURSES MODAL */}
            <Dialog
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                fullWidth
                maxWidth='sm'
                slotProps={{ paper: { className: '!rounded-2xl' } }}
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Student Profile & Enrollments
                </DialogTitle>
                <DialogContent dividers>
                    {selectedStudent && (
                        <div className='space-y-5'>
                            <div className='flex items-center gap-4'>
                                <Avatar className='!bg-blue-600 !w-14 !h-14 !text-xl'>
                                    {selectedStudent.firstName?.charAt(0) || 'S'}
                                    {selectedStudent.lastName?.charAt(0) || ''}
                                </Avatar>
                                <div>
                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </Typography>
                                    <div className='flex items-center gap-1.5 text-slate-500 text-sm mt-0.5'>
                                        <EmailOutlined fontSize='inherit' />
                                        <span>{selectedStudent.email}</span>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <div>
                                <Typography variant='subtitle2' className='!font-bold !text-slate-700 mb-3 flex items-center gap-1.5'>
                                    <MenuBookOutlined fontSize='small' className='text-blue-600' />
                                    Enrolled Courses ({studentEnrolledCourses.length})
                                </Typography>
                                {studentEnrolledCourses.length > 0 ? (
                                    <div className='space-y-2.5'>
                                        {studentEnrolledCourses.map(course => (
                                            <div
                                                key={course._id}
                                                className='p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between'
                                            >
                                                <div>
                                                    <Typography className='!font-semibold !text-slate-800 !text-sm'>
                                                        {course.courseName}
                                                    </Typography>
                                                    <Typography variant='caption' className='!text-slate-500'>
                                                        {course.courseCode} • {course.semester || '1st Semester'}
                                                    </Typography>
                                                </div>
                                                <Chip
                                                    size='small'
                                                    label={course.status || 'Active'}
                                                    className={course.status === 'Active' ? '!bg-green-100 !text-green-800' : '!bg-slate-200 !text-slate-700'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm'>
                                        This student is not enrolled in any courses yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions className='!px-6 !py-4'>
                    <Button onClick={() => setDetailsModalOpen(false)} className='!normal-case !text-slate-600'>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
        </RoleScreen>
    )
}