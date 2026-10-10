import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, PersonOutlined, Search, WarningAmber, ContentCopy } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function StudentManagement() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [openAddStudent, setOpenAddStudent] = useState(false)
    const [openEditStudent, setOpenEditStudent] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

    const [studentToDelete, setStudentToDelete] = useState(null)
    const [selectedStudent, setSelectedStudent] = useState(null)

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [statusFilter, setStatusFilter] = useState('All')
    const [search, setSearch] = useState('')


    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

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

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const response = await api.get('/students', getAuthConfig())
            if (Array.isArray(response.data)) {
                setStudents(response.data)
            } else if (Array.isArray(response.data?.students)) {
                setStudents(response.data.students)
            } else if (Array.isArray(response.data?.data)) {
                setStudents(response.data.data)
            } else {
                setStudents([])
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve students')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStudents()
    }, [fetchStudents])

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
    }

    const handleAddStudent = async () => {
        try {
            setError('')
            if (!formData.studentId.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.course.trim() || !formData.yearLevel.trim()) {
                setError('Please complete all required fields')
                return
            }

            await api.post('/students', {
                studentId: formData.studentId.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                course: formData.course.trim(),
                yearLevel: formData.yearLevel.trim(),
                status: formData.status.toLowerCase()
            }, getAuthConfig())

            setOpenAddStudent(false)
            resetForm()
            setMessage('Student added successfully')
            await fetchStudents()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student')
        }
    }

    const handleOpenEdit = async (id) => {
        try {
            setError('')
            if (!id) return
            const response = await api.get(`/students/${id}`, getAuthConfig())
            const student = response.data
            setSelectedStudent(student)
            setFormData({
                firstName: student.firstName || '',
                lastName: student.lastName || '',
                email: student.email || '',
                course: student.course || '',
                yearLevel: student.yearLevel || '',
                studentId: student.studentId || '',
                status: student.status || 'Active'
            })
            setOpenEditStudent(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve student')
        }
    }


    const handleUpdateStudent = async () => {
        const id = selectedStudent?._id || selectedStudent?.id
        if (!id) {
            setError('Student ID is missing')
            return
        }
        if (!formData.studentId.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.course.trim() || !formData.yearLevel.trim()) {
            setError('Please complete all required fields')
            return
        }
        try {
            setError('')
            const payload = {
                studentId: formData.studentId.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                course: formData.course.trim(),
                yearLevel: formData.yearLevel.trim(),
                status: formData.status.toLowerCase()
            }
            await api.put(`/students/${id}`, payload, getAuthConfig())
            setOpenEditStudent(false)
            resetForm()
            setMessage('Student updated successfully')
            await fetchStudents()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update student')
        }
    }

    const handleOpenDelete = (student) => {
        setStudentToDelete(student)
        setOpenDeleteDialog(true)
    }

    const handleCloseDelete = () => {
        if (deleteLoading) return

        setOpenDeleteDialog(false)
        setStudentToDelete(null)
    }

    const handleDeleteStudent = async () => {
        const id = studentToDelete?._id || studentToDelete?.id
        if (!id) {
            setError('Student ID is missing')
            return
        }

        try {
            setDeleteLoading(true)
            setError('')
            await api.delete(`/students/${id}`, getAuthConfig())

            setStudents(prev => prev.filter(student => student._id !== studentToDelete._id))

            setOpenDeleteDialog(false)
            setStudentToDelete(null)

            setMessage('Student deleted successfully')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete student')
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

    return (
        <>
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
                        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
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
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                            {[
                                ['Total Students', students.length],
                                ['Active Students', students.filter(student => student.status?.toLowerCase() === 'active').length,],
                                ['Inactive Students', students.filter(student => student.status?.toLowerCase() === 'inactive').length,],
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

                        {/* Filter Bar */}
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 p-5 border-b border-slate-200'>
                                    <TextField
                                        size='small'
                                        placeholder='Search by name or email...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search className='!text-slate-400 !mr-2' />
                                        }}
                                    />
                                    <TextField
                                        select
                                        size='small'
                                        label='Status'
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value='All'>All Statuses</MenuItem>
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
                                            {filteredStudents.map((student, idx) => (
                                                <tr key={student._id || student.id || idx} className='hover:bg-slate-50'>
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
                                                            label={student.status === "active"
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
                                                    <td className='px-6 py-4'>
                                                        <div className='flex justify-end gap-1'>
                                                            <IconButton
                                                                size='small'
                                                                title='Edit'
                                                                onClick={() => handleOpenEdit(student._id || student.id)}
                                                            >
                                                                <EditOutlined fontSize='small' />
                                                            </IconButton>
                                                            <IconButton
                                                                size='small'
                                                                color='error'
                                                                title='Delete'
                                                                onClick={() => handleOpenDelete(student)}
                                                            >
                                                                <DeleteOutlined fontSize='small' />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredStudents.length === 0 && (
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
                            label='Student Number'
                            name='studentId'
                            value={formData.studentId}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Course / Program'
                            type='text'
                            name='course'
                            value={formData.course}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Year Level'
                            type='text'
                            name='yearLevel'
                            value={formData.yearLevel}
                            onChange={handleFormChange}
                        />
                        <TextField
                            select
                            fullWidth
                            label='Status'
                            name='status'
                            value={formData.status}
                            onChange={handleFormChange}
                        >
                            <MenuItem value='active'>Active</MenuItem>
                            <MenuItem value='inactive'>Inactive</MenuItem>
                        </TextField>
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
                        Add Student
                    </Button>
                </DialogActions>
            </Dialog>

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
                        />
                        <TextField
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Course / Program'
                            type='text'
                            name='course'
                            value={formData.course}
                            onChange={handleFormChange}
                        />
                        <TextField
                            fullWidth
                            label='Year Level'
                            type='text'
                            name='yearLevel'
                            value={formData.yearLevel}
                            onChange={handleFormChange}
                        />
                        <TextField
                            select
                            fullWidth
                            label='Status'
                            name='status'
                            value={formData.status}
                            onChange={handleFormChange}
                        >
                            <MenuItem value='active'>Active</MenuItem>
                            <MenuItem value='inactive'>Inactive</MenuItem>
                        </TextField>
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
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                fullWidth
                maxWidth='xs'
                PaperProps={{
                    className: '!rounded-2xl'
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

                        {studentToDelete && (
                            <div className='w-full mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3'>
                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                    {studentToDelete.firstName} {studentToDelete.lastName}
                                </Typography>

                                <Typography variant='caption' className='!text-slate-500'>
                                    {studentToDelete.email}
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
                        onClick={handleCloseDelete}
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
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Notifications */}
            <Snackbar
                open={Boolean(message)}
                autoHideDuration={3000}
                onClose={() => setMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setMessage('')} severity='success' variant='filled'>
                    {message}
                </Alert>
            </Snackbar>

            <Snackbar
                open={Boolean(error)}
                autoHideDuration={4000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setError('')} severity='error' variant='filled'>
                    {error}
                </Alert>
            </Snackbar>
        </>
    )
}