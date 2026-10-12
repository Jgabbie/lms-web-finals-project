import RoleScreen from '../../components/StudentScreen'
import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar, CircularProgress, Pagination } from '@mui/material'
import { AddRounded as Add, DeleteRounded as DeleteOutlined, EditRounded as EditOutlined, PersonRounded as PersonOutlined, SearchRounded as Search, WarningAmberRounded as WarningAmber, VisibilityRounded as VisibilityOutlined, RestoreFromTrashRounded as RestoreFromTrash } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function StudentManagement() {
    const [currentPage, setCurrentPage] = useState(1)
    const usersPerPage = 10

    const [activeTab, setActiveTab] = useState('active')
    const [archivedUsers, setArchivedUsers] = useState([])

    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [openAddStudent, setOpenAddStudent] = useState(false)
    const [openEditStudent, setOpenEditStudent] = useState(false)
    const [openDeleteStudent, setOpenDeleteStudent] = useState(false)
    const [openViewStudent, setOpenViewStudent] = useState(false)

    const [selectedStudent, setSelectedStudent] = useState(null)

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [statusFilter, setStatusFilter] = useState('All')
    const [search, setSearch] = useState('')

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const showNotification = useCallback((message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        })
    }, [])

    const closeNotification = (_, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setNotification({ ...notification, open: false })
    }

    const [fieldErrors, setFieldErrors] = useState({})
    const [formData, setFormData] = useState({
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        course: '',
        yearLevel: '',
        status: 'active'
    })

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    const fetchArchivedUsers = useCallback(() => {
        return api.get('/students/archived', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => setArchivedUsers(response.data))
            .catch(error => {
                console.error('Error fetching archived users:', error)
                showNotification(error.response?.data?.message || 'Failed to retrieve archived users', 'error')
            })
    }, [showNotification])

    const restoreUser = async (id) => {
        try {
            await api.post(`/students/restore/${id}`, {}, getAuthConfig())
            showNotification('User restored successfully', 'success')
            await fetchStudents()
            await fetchArchivedUsers()
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to restore user', 'error')
        }
    }

    const requestFetchStudents = useCallback(() => {
        return api.get('/students', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(async (response) => {
            setStudents(response.data)

        }).catch((error) => {
            console.error('Error fetching students:', error)
            showNotification(error.response?.data?.message || 'Failed to retrieve students', 'error')
        }).finally(() => {
            setLoading(false)
        })
    }, [showNotification])

    const fetchStudents = async () => {
        setLoading(true)
        await requestFetchStudents()
    }

    useEffect(() => {
        requestFetchStudents()
        fetchArchivedUsers()
    }, [requestFetchStudents, fetchArchivedUsers])

    const validateStudentForm = () => {
        const errors = {}

        const studentId = formData.studentId?.trim()
        const firstName = formData.firstName?.trim()
        const lastName = formData.lastName?.trim()
        const email = formData.email?.trim()
        const course = formData.course?.trim()
        const yearLevel = formData.yearLevel?.trim()

        if (!studentId) {
            errors.studentId = 'Student ID is required'
        } else if (!/^\d{4}-\d{6}$/.test(studentId)) {
            errors.studentId = 'Format must be YYYY-NNNNNN (e.g., 2023-123456)'
        }

        const namePattern = /^[\p{L}]+(?:['\u{2019}]?[\p{L}]+)*$/u

        if (!firstName) {
            errors.firstName = 'First Name is required'
        } else if (firstName.length < 2) {
            errors.firstName = 'First Name must be at least 2 characters long'
        } else if (firstName.length > 50) {
            errors.firstName = 'First Name must not exceed 50 characters'
        } else if (!namePattern.test(firstName)) {
            errors.firstName = 'Please enter a valid first name'
        }

        if (!lastName) {
            errors.lastName = 'Last Name is required'
        } else if (lastName.length < 2) {
            errors.lastName = 'Last Name must be at least 2 characters long'
        } else if (lastName.length > 50) {
            errors.lastName = 'Last Name must not exceed 50 characters'
        } else if (!namePattern.test(lastName)) {
            errors.lastName = 'Please enter a valid last name'
        }

        if (!email) {
            errors.email = 'Email is required'
        } else if (email.length < 6) {
            errors.email = 'Email must be at least 6 characters'
        } else if (email.length > 100) {
            errors.email = 'Email must not exceed 100 characters'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address'
        }

        if (!course) {
            errors.course = 'Course is required'
        } else if (course.length < 2) {
            errors.course = 'Course must be at least 2 characters'
        } else if (course.length > 100) {
            errors.course = 'Course must not exceed 100 characters'
        }

        if (!yearLevel) {
            errors.yearLevel = 'Year Level is required'
        } else if (yearLevel.length < 1) {
            errors.yearLevel = 'Year Level must be at least 1 character'
        } else if (yearLevel.length > 10) {
            errors.yearLevel = 'Year Level must not exceed 10 characters'
        }

        setFieldErrors(errors)

        return Object.keys(errors).length === 0
    }


    const resetForm = () => {
        setFormData({
            studentId: '',
            firstName: '',
            lastName: '',
            email: '',
            course: '',
            yearLevel: '',
            status: 'active'
        })
        setSelectedStudent(null)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleAddStudent = async () => {
        setFieldErrors({})
        if (!validateStudentForm()) {
            return
        }

        try {
            setSaving(true)

            await api.post('/students', {
                studentId: formData.studentId.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                course: formData.course.trim(),
                yearLevel: formData.yearLevel.trim(),
            }, getAuthConfig())

            setOpenAddStudent(false)
            resetForm()
            showNotification('Student added successfully', 'success')
            await fetchStudents()
        } catch (error) {
            console.error('Add student error:', error)
            showNotification(error.response?.data?.message || 'Failed to add student', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateStudent = async () => {
        const id = selectedStudent?._id || selectedStudent?.id
        if (!id) {
            showNotification('Student ID is missing', 'error')
            return
        }

        setFieldErrors({})
        if (!validateStudentForm()) {
            return
        }
        try {
            setSaving(true)
            const payload = {
                studentId: formData.studentId.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                course: formData.course.trim(),
                yearLevel: formData.yearLevel.trim(),
            }
            await api.put(`/students/${id}`, payload, getAuthConfig())
            setOpenEditStudent(false)
            resetForm()
            showNotification('Student updated successfully', 'success')
            await fetchStudents()
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update student', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteStudent = async () => {
        const id = selectedStudent?._id || selectedStudent?.id
        if (!id) {
            showNotification('No Student selected for deletion', 'error')
            return
        }

        try {
            setDeleteLoading(true)
            await api.delete(`/students/${id}`, getAuthConfig())

            setStudents(prev => prev.filter(student => student._id !== selectedStudent._id))

            setOpenDeleteStudent(false)
            setSelectedStudent(null)
            showNotification('Student deleted successfully', 'success')
            await fetchStudents()
        } catch (error) {
            console.error('Delete student error:', error)
            showNotification(error.response?.data?.message || 'Failed to delete student', 'error')
        } finally {
            setDeleteLoading(false)
        }
    }

    const filteredStudents = useMemo(() => {
        const key = search.toLowerCase()
        return students.filter(student => {
            const firstName = student.firstName || ''
            const lastName = student.lastName || ''
            const email = student.email || ''
            const course = student.course || ''
            const yearLevel = student.yearLevel || ''

            const matchesSearch =
                firstName.toLowerCase().includes(key) ||
                lastName.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key) ||
                course.toLowerCase().includes(key) ||
                yearLevel.toLowerCase().includes(key)
            const matchesStatus =
                statusFilter === 'All' || student.status?.toLowerCase() === statusFilter.toLowerCase()

            return matchesSearch && matchesStatus
        })
    }, [students, search, statusFilter])

    const filteredArchivedStudents = useMemo(() => {
        const key = search.toLowerCase()
        return archivedUsers.filter(student => {
            const firstName = student.firstName || ''
            const lastName = student.lastName || ''
            const email = student.email || ''
            const course = student.course || ''
            const yearLevel = student.yearLevel || ''

            const matchesSearch =
                firstName.toLowerCase().includes(key) ||
                lastName.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key) ||
                course.toLowerCase().includes(key) ||
                yearLevel.toLowerCase().includes(key)
            const matchesStatus =
                statusFilter === 'All' || student.status?.toLowerCase() === statusFilter.toLowerCase()

            return matchesSearch && matchesStatus
        })
    }, [archivedUsers, search, statusFilter])


    const displayedUsers = activeTab === 'active' ? filteredStudents : filteredArchivedStudents

    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(displayedUsers.length / usersPerPage)


    const initials = name =>
        name.replace('Prof. ', '').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()

    return (
        <RoleScreen page="studentmanagement" role="admin">
            <div className='min-h-screen bg-slate-50'>
                <NavbarAdmin />
                <SidebarAdmin
                    open={sidebarOpen}
                    setOpen={setSidebarOpen}
                />
                <div
                    className='transition-all duration-300'
                    style={{
                        marginLeft: sidebarOpen ? '260px' : '72px'
                    }}
                >
                    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                        <div className='student-page-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                            <div>
                                <Typography variant='h4' className='!font-bold !text-slate-800'>
                                    Students Management
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Monitor student accounts, roles, and access credentials
                                </Typography>
                            </div>
                            <Button
                                variant='contained'
                                startIcon={<Add />}
                                onClick={() => {
                                    resetForm()
                                    setOpenAddStudent(true)
                                }}
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Add Student
                            </Button>
                        </div>

                        {/* Top Stats */}
                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                            {[
                                ['Total Students', students.length],
                                ['Active Students', students.filter(student => student.status?.toLowerCase() === 'active').length,],
                                ['Inactive Students', archivedUsers.filter(student => student.status?.toLowerCase() === 'inactive').length,],
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

                        <div className='flex gap-2 border-b border-slate-200 px-5 pt-4'>
                            <button
                                onClick={() => { setActiveTab('active'); setCurrentPage(1) }}
                                className={`px-4 py-2 font-semibold ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                            >
                                Active Users
                            </button>
                            <button
                                onClick={() => { setActiveTab('archived'); setCurrentPage(1) }}
                                className={`px-4 py-2 font-semibold ${activeTab === 'archived' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
                            >
                                Archived Users ({archivedUsers.length})
                            </button>
                        </div>

                        {/* Filter Bar */}
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 p-5 border-b border-slate-200'>
                                    <TextField
                                        size='small'
                                        placeholder='Search by name or email...'
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                                        slotProps={{
                                            input: {
                                                startAdornment: <Search className='!text-slate-400 !mr-2' />
                                            }
                                        }}
                                    />
                                    <TextField
                                        select
                                        size='small'
                                        label='Status'
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                                    >
                                        <MenuItem value='All'>All Status</MenuItem>
                                        <MenuItem value='active'>Active</MenuItem>
                                        <MenuItem value='inactive'>Inactive</MenuItem>
                                    </TextField>
                                </div>

                                {/* Table */}
                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[900px] text-sm'>
                                        <thead className='bg-slate-50 text-slate-500'>
                                            <tr>
                                                <th className='text-left font-semibold px-6 py-4'>Full Name</th>
                                                <th className='text-left font-semibold px-6 py-4'>Email</th>
                                                <th className='text-left font-semibold px-6 py-4'>Student Number</th>
                                                <th className='text-left font-semibold px-6 py-4'>Course</th>
                                                <th className='text-left font-semibold px-6 py-4'>Year Level</th>
                                                <th className='text-left font-semibold px-6 py-4'>Status</th>
                                                <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100'>
                                            {currentUsers.map((student) => (
                                                <tr key={student._id || student.id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <Avatar className='!bg-blue-600 !text-sm'>
                                                                {student.firstName?.charAt(0) || 'U'}
                                                                {student.lastName?.charAt(0) || ''}
                                                            </Avatar>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {student.firstName || ''} {student.lastName || ''}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {student.email || '—'}
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {student.studentId || '—'}
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {student.course || '—'}
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {student.yearLevel || '—'}
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={student.status.trim().toLowerCase() === "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                            }
                                                            className={
                                                                student.status === 'active'
                                                                    ? '!bg-green-50 !text-green-700'
                                                                    : '!bg-slate-100 !text-slate-600'
                                                            }
                                                        />
                                                    </td>
                                                    <td className='px-6 py-4 text-right'>
                                                        {activeTab === 'archived' ? (
                                                            <IconButton
                                                                size='small'
                                                                title='Restore'
                                                                variant='outlined'
                                                                onClick={() => restoreUser(student._id || student.id)}
                                                            >
                                                                <RestoreFromTrash fontSize='small' />
                                                            </IconButton>
                                                        ) : (
                                                            <div>
                                                                <IconButton
                                                                    size='small'
                                                                    title='View'
                                                                    onClick={() => {
                                                                        setSelectedStudent(student)
                                                                        setOpenViewStudent(true)
                                                                    }}
                                                                >
                                                                    <VisibilityOutlined fontSize='small' />
                                                                </IconButton>
                                                                <IconButton
                                                                    size='small'
                                                                    title='Edit'
                                                                    onClick={() => {
                                                                        setSelectedStudent(student)
                                                                        setFormData({
                                                                            firstName: student.firstName,
                                                                            lastName: student.lastName,
                                                                            email: student.email,
                                                                            role: student.role,
                                                                            course: student.course,
                                                                            yearLevel: student.yearLevel,
                                                                            status: student.status,
                                                                        })
                                                                        setOpenEditStudent(true)
                                                                    }}
                                                                >
                                                                    <EditOutlined fontSize='small' />
                                                                </IconButton>
                                                                <IconButton
                                                                    size='small'
                                                                    color='error'
                                                                    title='Delete'
                                                                    onClick={() => {
                                                                        setSelectedStudent(student)
                                                                        setOpenDeleteStudent(true)
                                                                    }}
                                                                >
                                                                    <DeleteOutlined fontSize='small' />
                                                                </IconButton>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {(activeTab === 'active'
                                        ? filteredStudents
                                        : archivedUsers.filter(
                                            user => {
                                                const matchesSearch =
                                                    `${user.firstName || ''} ${user.lastName || ''} `.toLowerCase().includes(search.toLowerCase()) ||
                                                    (user.email || '').toLowerCase().includes(search.toLowerCase())
                                                return matchesSearch
                                            }
                                        )).length === 0 && (
                                            <div className='py-14 text-center'>
                                                <PersonOutlined className='!text-slate-300 !text-5xl' />
                                                <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                                    {loading ? 'Loading students...' : 'No students found'}
                                                </Typography>
                                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                                    Try changing your search or status filter.
                                                </Typography>
                                            </div>
                                        )}
                                </div>

                                {displayedUsers.length > 0 && (
                                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-slate-200'>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredStudents.length)} of {filteredStudents.length} students
                                        </Typography>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={(event, page) => setCurrentPage(page)}
                                            color='primary'
                                            shape='rounded'
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

            {/* Add Student Modal */}
            <Dialog
                open={openAddStudent}
                onClose={() => setOpenAddStudent(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Add Student
                </DialogTitle>
                <DialogContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>

                        <TextField
                            fullWidth
                            required
                            label='Student Number'
                            name='studentId'
                            value={formData.studentId}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.studentId)}
                            helperText={fieldErrors.studentId}
                            slotProps={{ htmlInput: { maxLength: 11 } }}
                        />
                        <TextField
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.firstName)}
                            helperText={fieldErrors.firstName}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        <TextField
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.lastName)}
                            helperText={fieldErrors.lastName}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        <TextField
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.email)}
                            helperText={fieldErrors.email}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        <TextField
                            fullWidth
                            label='Course / Program'
                            type='text'
                            name='course'
                            value={formData.course}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.course)}
                            helperText={fieldErrors.course}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        <TextField
                            fullWidth
                            label='Year Level'
                            type='text'
                            name='yearLevel'
                            value={formData.yearLevel}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.yearLevel)}
                            helperText={fieldErrors.yearLevel}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setOpenAddStudent(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleAddStudent}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openViewStudent}
                onClose={() => setOpenViewStudent(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Student Details
                </DialogTitle>

                <DialogContent>
                    {selectedStudent && (
                        <div className='space-y-5 pt-2'>
                            <div className='flex items-center gap-4'>
                                <Avatar src={selectedStudent.avatar} alt={selectedStudent.name} className='!bg-blue-600 !w-14 !h-14'>
                                    {initials(`${selectedStudent.firstName} ${selectedStudent.lastName}`)}
                                </Avatar>

                                <div>
                                    <Typography variant='h6' className='!font-semibold !text-slate-800'>
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        {selectedStudent.studentId}
                                    </Typography>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Email
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedStudent.email}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Course
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedStudent.course}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Year Level
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedStudent.yearLevel}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Status
                                    </Typography>

                                    <div className='!mt-1'>
                                        <Chip
                                            size='small'
                                            label={selectedStudent.status === 'active' ? 'Active' : 'Inactive'}
                                            className={
                                                selectedStudent.status === 'active'
                                                    ? '!bg-green-50 !text-green-700'
                                                    : '!bg-slate-100 !text-slate-600'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent >

                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenViewStudent(false)}
                        className='!normal-case !text-slate-600'
                    >
                        {saving ? <CircularProgress size={20} className='!text-slate-600' /> : 'Close'}
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Edit Student Modal */}
            <Dialog
                open={openEditStudent}
                onClose={() => setOpenEditStudent(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Edit Student
                </DialogTitle>
                <DialogContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
                        <TextField
                            fullWidth
                            label='Student Number'
                            name='studentId'
                            value={formData.studentId}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.studentId)}
                            helperText={fieldErrors.studentId}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.firstName)}
                            helperText={fieldErrors.firstName}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        <TextField
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.lastName)}
                            helperText={fieldErrors.lastName}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                        />
                        <TextField
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.email)}
                            helperText={fieldErrors.email}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        <TextField
                            fullWidth
                            label='Course / Program'
                            type='text'
                            name='course'
                            value={formData.course}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.course)}
                            helperText={fieldErrors.course}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        <TextField
                            fullWidth
                            label='Year Level'
                            type='text'
                            name='yearLevel'
                            value={formData.yearLevel}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.yearLevel)}
                            helperText={fieldErrors.yearLevel}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setOpenEditStudent(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleUpdateStudent}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openDeleteStudent}
                onClose={() => setOpenDeleteStudent(false)}
                fullWidth
                maxWidth='xs'
                slotProps={{
                    paper: {
                        className: '!rounded-2xl'
                    }
                }}
            >
                <DialogContent className='!px-6 !pt-7 !pb-3'>
                    <div className='flex flex-col items-center text-center'>

                        <div className='w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4'>
                            <WarningAmber className='!text-red-500 !text-4xl' />
                        </div>

                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                            Delete Student Account?
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-2 !leading-6'>
                            Are you sure you want to delete this account?
                        </Typography>

                        {selectedStudent && (
                            <div className='w-full mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3'>
                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                    {selectedStudent.firstName} {selectedStudent.lastName}
                                </Typography>

                                <Typography variant='caption' className='!text-slate-500'>
                                    {selectedStudent.email}
                                </Typography>
                            </div>
                        )}

                        <Typography variant='caption' className='!text-slate-500 !mt-4'>
                            This action cannot be undone
                        </Typography>
                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-6 !pt-4 !justify-center !gap-2'>
                    <Button
                        onClick={() => setOpenDeleteStudent(false)}
                        disabled={deleteLoading}
                        variant='outlined'
                        className='!normal-case !rounded-lg !border-slate-300 !text-slate-600 hover:!bg-slate-50 !px-5'
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleDeleteStudent}
                        disabled={deleteLoading}
                        variant='contained'
                        startIcon={<DeleteOutlined />}
                        className='!normal-case !rounded-lg !bg-red-600 hover:!bg-red-700 !shadow-none !px-5'
                    >
                        {deleteLoading ? <CircularProgress size={20} className='!text-white' /> : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={closeNotification}
                    severity={notification.severity}
                    variant='filled'
                    elevation={6}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </RoleScreen>
    )
}