import RoleScreen from '../../components/StudentScreen'
import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar, CircularProgress, Pagination } from '@mui/material'
import { AddRounded as Add, DeleteRounded as DeleteOutlined, EditRounded as EditOutlined, PersonRounded as PersonOutlined, SearchRounded as Search, VisibilityRounded as VisibilityOutlined, RestoreFromTrashRounded as RestoreFromTrash } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function ActivityLogs() {
    const [currentPage, setCurrentPage] = useState(1)
    const usersPerPage = 10

    const [activeTab, setActiveTab] = useState('active')
    const [archivedUsers, setArchivedUsers] = useState([])

    const [instructors, setInstructors] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [openAddInstructor, setOpenAddInstructor] = useState(false)
    const [openEditInstructor, setOpenEditInstructor] = useState(false)
    const [openDeleteInstructor, setOpenDeleteInstructor] = useState(false)
    const [openViewInstructor, setOpenViewInstructor] = useState(false)

    const [selectedInstructor, setSelectedInstructor] = useState(null)

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

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
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        specialization: '',
        status: 'active',
    })

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    const fetchArchivedUsers = useCallback(() => {
        return api.get('/instructors/archived/instructors', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => setArchivedUsers(response.data))
            .catch(error => {
                console.error('Error fetching archived users:', error)
                showNotification(error.response?.data?.message || 'Failed to retrieve archived users', 'error')
            })
    }, [showNotification])

    const restoreUser = async (id) => {
        try {
            await api.post(`/instructors/restore/instructors/${id}`, {}, getAuthConfig())
            showNotification('User restored successfully', 'success')
            await fetchInstructors()
            await fetchArchivedUsers()
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to restore user', 'error')
        }
    }


    const requestFetchInstructors = useCallback(() => {
        return api.get('/instructors/instructors', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(async (response) => {
            setInstructors(response.data)

        }).catch((error) => {
            console.error('Error fetching instructors:', error)
            showNotification(
                'Failed to fetch instructors. Please try again later.',
                'error'
            )
        }).finally(() => {
            setLoading(false)
        })
    }, [showNotification])

    const fetchInstructors = async () => {
        setLoading(true)
        await requestFetchInstructors()
    }

    useEffect(() => {
        requestFetchInstructors()
        fetchArchivedUsers()
    }, [requestFetchInstructors, fetchArchivedUsers])

    const validateInstructorForm = () => {
        const errors = {}

        const firstName = formData.firstName?.trim() || ''
        const lastName = formData.lastName?.trim() || ''
        const email = formData.email?.trim() || ''
        const department = formData.department?.trim() || ''
        const specialization = formData.specialization?.trim() || ''

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

        if (!specialization) {
            errors.specialization = 'Specialization is required'
        } else if (specialization.length < 2) {
            errors.specialization = 'Specialization must be at least 2 characters'
        } else if (specialization.length > 100) {
            errors.specialization = 'Specialization must not exceed 100 characters'
        }

        if (!department) {
            errors.department = 'Department is required'
        } else if (department.length < 2) {
            errors.department = 'Department must be at least 2 characters'
        } else if (department.length > 100) {
            errors.department = 'Department must not exceed 100 characters'
        }

        setFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            department: '',
            specialization: '',
            status: 'active',
        })
        setSelectedInstructor(null)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleAddInstructor = async () => {
        setFieldErrors({})
        if (!validateInstructorForm()) {
            return
        }
        try {
            setSaving(true)

            await api.post('/instructors/add/instructors', {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                department: formData.department.trim(),
                specialization: formData.specialization.trim(),
            }, getAuthConfig())

            setOpenAddInstructor(false)
            resetForm()
            showNotification('Instructor added successfully!', 'success')
            await fetchInstructors()
        } catch (error) {
            console.error('Error adding instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to add instructor.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateInstructor = async () => {
        const id = selectedInstructor?._id || selectedInstructor?.id
        if (!id) {
            showNotification('No instructor selected for update.', 'error')
            return
        }

        setFieldErrors({})
        if (!validateInstructorForm()) return
        try {
            setSaving(true)
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                department: formData.department.trim(),
                specialization: formData.specialization.trim(),
            }
            await api.put(`/instructors/update/instructors/${selectedInstructor._id}`, payload, getAuthConfig())
            setOpenEditInstructor(false)
            resetForm()
            showNotification('Instructor updated successfully', 'success')
            await fetchInstructors()
        } catch (error) {
            console.error('Error editing instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to edit instructor.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteInstructor = async () => {
        const id = selectedInstructor?._id || selectedInstructor?.id
        if (!id) {
            showNotification('No instructor selected for deletion.', 'error')
            return
        }

        try {
            setDeleteLoading(true)

            await api.delete(`/instructors/delete/instructors/${id}`, getAuthConfig())

            setOpenDeleteInstructor(false)
            setSelectedInstructor(null)
            showNotification('Instructor deleted successfully', 'success')
            await fetchInstructors()
        } catch (error) {
            console.error('Error deleting instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to delete instructor.', 'error')
        } finally {
            setDeleteLoading(false)
        }

    }

    const filteredInstructors = useMemo(() => {
        const key = search.toLowerCase()
        return instructors.filter(instructor => {
            const fullName = `${instructor.firstName} ${instructor.lastName}`.toLowerCase()

            const matchesSearch =
                fullName.includes(key) ||
                instructor.email.toLowerCase().includes(key) ||
                instructor.instructorId.toLowerCase().includes(key) ||
                instructor.specialization.toLowerCase().includes(key)

            const matchesDepartment =
                departmentFilter === 'All' || instructor.department === departmentFilter
            const matchesStatus =
                statusFilter === 'All' || instructor.status?.toLowerCase() === statusFilter.toLowerCase()

            return matchesSearch && matchesDepartment && matchesStatus
        })
    }, [instructors, search, statusFilter, departmentFilter])

    const filteredArchivedInstructors = useMemo(() => {
        const key = search.toLowerCase()
        return archivedUsers.filter(instructor => {
            const fullName = `${instructor.firstName} ${instructor.lastName}`.toLowerCase()

            const matchesSearch =
                fullName.includes(key) ||
                instructor.email.toLowerCase().includes(key) ||
                instructor.instructorId.toLowerCase().includes(key) ||
                instructor.specialization.toLowerCase().includes(key)

            const matchesDepartment =
                departmentFilter === 'All' || instructor.department === departmentFilter
            const matchesStatus =
                statusFilter === 'All' || instructor.status?.toLowerCase() === statusFilter.toLowerCase()

            return matchesSearch && matchesDepartment && matchesStatus
        })
    }, [archivedUsers, search, statusFilter, departmentFilter])

    const displayedUsers = activeTab === 'active' ? filteredInstructors : filteredArchivedInstructors

    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(displayedUsers.length / usersPerPage)


    const initials = name =>
        name.replace('Prof. ', '').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()

    return (
        <RoleScreen page="instructormanagement" role="admin">
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
                                    Instructor Management
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Monitor instructor accounts, departments, and course assignments.
                                </Typography>
                            </div>

                            <Button
                                variant='contained'
                                startIcon={<Add />}
                                onClick={() => {
                                    setFormData({
                                        firstName: '',
                                        lastName: '',
                                        email: '',
                                        department: '',
                                        specialization: '',
                                        status: 'active',
                                    })
                                    setOpenAddInstructor(true)
                                }}
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Add Instructor
                            </Button>
                        </div>


                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                            {[
                                ['Total Instructors', instructors.length],
                                ['Active', instructors.filter(instructor => instructor.status?.toLowerCase() === 'active').length,],
                                ['Inactive', instructors.filter(instructor => instructor.status?.toLowerCase() === 'inactive').length,],
                                ['Specializations', new Set(instructors.map(instructor => instructor.specialization?.trim()).filter(Boolean)).size],
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

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3 p-5 border-b border-slate-200'>
                                    <TextField
                                        size='small'
                                        placeholder='Search name, email, instructor ID or specialization...'
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                                        slotProps={{
                                            startAdornment: <Search className='!text-slate-400 !mr-2' />
                                        }}
                                    />

                                    <TextField
                                        select
                                        size='small'
                                        label='Department'
                                        value={departmentFilter}
                                        onChange={(e) => setDepartmentFilter(e.target.value)}
                                    >
                                        <MenuItem value='All'>All Departments</MenuItem>
                                        <MenuItem value='Information Technology'>Information Technology</MenuItem>
                                        <MenuItem value='Computer Science'>Computer Science</MenuItem>
                                        <MenuItem value='Information Systems'>Information Systems</MenuItem>
                                    </TextField>


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

                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[850px] text-sm'>
                                        <thead className='bg-slate-50 text-slate-500'>
                                            <tr>
                                                <th className='text-left font-semibold px-6 py-4'>Instructor</th>
                                                <th className='text-left font-semibold px-6 py-4'>Department</th>
                                                <th className='text-left font-semibold px-6 py-4'>Specialization</th>
                                                <th className='text-left font-semibold px-6 py-4'>Status</th>
                                                <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody className='divide-y divide-slate-100'>

                                            {currentUsers.map((instructor) =>
                                                <tr key={instructor.id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <Avatar className='!bg-blue-600'>
                                                                {initials(`${instructor.firstName} ${instructor.lastName}`)}
                                                            </Avatar>

                                                            <div>
                                                                <Typography className='!font-semibold !text-slate-800'>
                                                                    {instructor.firstName} {instructor.lastName}
                                                                </Typography>
                                                                <Typography variant='caption' className='!text-slate-500'>
                                                                    {instructor.email}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {instructor.department}
                                                    </td>

                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {instructor.specialization}
                                                    </td>

                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={instructor.status === 'Active' ? 'Active' : 'Inactive'}
                                                            className={
                                                                instructor.status === 'active'
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
                                                                onClick={() => restoreUser(instructor._id || instructor.id)}
                                                            >
                                                                <RestoreFromTrash fontSize='small' />
                                                            </IconButton>
                                                        ) : (
                                                            <div>
                                                                <IconButton
                                                                    size='small'
                                                                    title='View'
                                                                    onClick={() => {
                                                                        setSelectedInstructor(instructor)
                                                                        setOpenViewInstructor(true)
                                                                    }}
                                                                >
                                                                    <VisibilityOutlined fontSize='small' />
                                                                </IconButton>
                                                                <IconButton
                                                                    size='small'
                                                                    title='Edit'
                                                                    onClick={() => {
                                                                        setSelectedInstructor(instructor)
                                                                        setFormData({
                                                                            firstName: instructor.firstName,
                                                                            lastName: instructor.lastName,
                                                                            email: instructor.email,
                                                                            role: instructor.role,
                                                                            department: instructor.department,
                                                                            specialization: instructor.specialization,
                                                                            status: instructor.status,
                                                                        })
                                                                        setOpenEditInstructor(true)
                                                                    }}
                                                                >
                                                                    <EditOutlined fontSize='small' />
                                                                </IconButton>
                                                                <IconButton
                                                                    size='small'
                                                                    color='error'
                                                                    title='Delete'
                                                                    onClick={() => {
                                                                        setSelectedInstructor(instructor)
                                                                        setOpenDeleteInstructor(true)
                                                                    }}
                                                                >
                                                                    <DeleteOutlined fontSize='small' />
                                                                </IconButton>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {(activeTab === 'active'
                                        ? filteredInstructors
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
                                                    {loading ? 'Loading instructors...' : 'No instructors found'}
                                                </Typography>
                                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                                    Try changing your search or filters.
                                                </Typography>
                                            </div>
                                        )}
                                </div>

                                {displayedUsers.length > 0 && (
                                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-slate-200'>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredInstructors.length)} of {filteredInstructors.length} instructors
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
                    </main >
                </div>
            </div >

            <Dialog
                open={openAddInstructor}
                onClose={() => setOpenAddInstructor(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle
                    className='!font-bold !text-slate-800'
                >
                    Add Instructor
                </DialogTitle>

                <DialogContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
                        <TextField
                            required
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.firstName)}
                            helperText={fieldErrors.firstName}
                            slotProps={{ maxLength: 50 }}
                        />
                        <TextField
                            required
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.lastName)}
                            helperText={fieldErrors.lastName}
                            slotProps={{ maxLength: 50 }}
                        />

                        <TextField
                            required
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.email)}
                            helperText={fieldErrors.email}
                            slotProps={{ maxLength: 100 }}
                        />

                        <TextField
                            required
                            select
                            fullWidth
                            label='Department'
                            name='department'
                            value={formData.department}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.department)}
                            helperText={fieldErrors.department}
                        >
                            <MenuItem value='Information Technology'>Information Technology</MenuItem>
                            <MenuItem value='Computer Science'>Computer Science</MenuItem>
                            <MenuItem value='Information Systems'>Information Systems</MenuItem>
                        </TextField>

                        <TextField
                            required
                            fullWidth
                            label='Specialization'
                            placeholder='e.g. Web Development'
                            name='specialization'
                            value={formData.specialization}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.specialization)}
                            helperText={fieldErrors.specialization}
                            slotProps={{ maxLength: 100 }}
                        />

                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenAddInstructor(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>

                    <Button
                        variant='contained'
                        onClick={handleAddInstructor}
                        disabled={saving}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Add Instructor'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openViewInstructor}
                onClose={() => setOpenViewInstructor(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Instructor Details
                </DialogTitle>

                <DialogContent>
                    {selectedInstructor && (
                        <div className='space-y-5 pt-2'>
                            <div className='flex items-center gap-4'>
                                <Avatar src={selectedInstructor.avatar} alt={selectedInstructor.name} className='!bg-blue-600 !w-14 !h-14'>
                                    {initials(`${selectedInstructor.firstName} ${selectedInstructor.lastName}`)}
                                </Avatar>

                                <div>
                                    <Typography variant='h6' className='!font-semibold !text-slate-800'>
                                        {selectedInstructor.firstName} {selectedInstructor.lastName}
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        {selectedInstructor.instructorId}
                                    </Typography>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Email
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedInstructor.email}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Department
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedInstructor.department}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Specialization
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedInstructor.specialization}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Status
                                    </Typography>

                                    <div className='!mt-1'>
                                        <Chip
                                            size='small'
                                            label={selectedInstructor.status === 'active' ? 'Active' : 'Inactive'}
                                            className={
                                                selectedInstructor.status === 'active'
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
                        onClick={() => setOpenViewInstructor(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog >


            <Dialog
                open={openEditInstructor}
                onClose={() => setOpenEditInstructor(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Edit Instructor
                </DialogTitle>
                <DialogContent>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
                        <TextField
                            required
                            fullWidth
                            label='First Name'
                            name='firstName'
                            value={formData.firstName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.firstName)}
                            helperText={fieldErrors.firstName}
                            slotProps={{ maxLength: 50 }}
                        />
                        <TextField
                            required
                            fullWidth
                            label='Last Name'
                            name='lastName'
                            value={formData.lastName}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.lastName)}
                            helperText={fieldErrors.lastName}
                            slotProps={{ maxLength: 50 }}
                        />
                        <TextField
                            required
                            fullWidth
                            label='Email Address'
                            type='email'
                            name='email'
                            value={formData.email}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.email)}
                            helperText={fieldErrors.email}
                            slotProps={{ maxLength: 100 }}
                        />

                        <TextField
                            required
                            select
                            fullWidth
                            label='Department'
                            name='department'
                            value={formData.department}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.status)}
                            helperText={fieldErrors.status}
                        >
                            <MenuItem value='Information Technology'>Information Technology</MenuItem>
                            <MenuItem value='Computer Science'>Computer Science</MenuItem>
                            <MenuItem value='Information Systems'>Information Systems</MenuItem>
                        </TextField>

                        <TextField
                            required
                            fullWidth
                            label='Specialization'
                            placeholder='e.g. Web Development'
                            name='specialization'
                            value={formData.specialization}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.specialization)}
                            helperText={fieldErrors.specialization}
                            slotProps={{ maxLength: 50 }}
                        />

                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenEditInstructor(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleUpdateInstructor}
                        disabled={saving}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog >


            <Dialog
                open={openDeleteInstructor}
                onClose={() => setOpenDeleteInstructor(false)}
                fullWidth
                maxWidth='xs'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography variant='body1' className='!text-slate-600'>
                        Are you sure you want to delete this instructor?
                    </Typography>

                    {selectedInstructor && (
                        <div className='w-full mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3'>
                            <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                {selectedInstructor.firstName} {selectedInstructor.lastName}
                            </Typography>

                            <Typography variant='caption' className='!text-slate-500'>
                                {selectedInstructor.email}
                            </Typography>
                        </div>
                    )}
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenDeleteInstructor(false)}
                        disabled={deleteLoading}
                        variant='outlined'
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteInstructor}
                        variant='contained'
                        disabled={deleteLoading}
                        startIcon={<DeleteOutlined />}
                        className='!normal-case !rounded-lg !bg-red-600 hover:!bg-red-700 !shadow-none !px-5'
                    >
                        {deleteLoading ? <CircularProgress size={20} className='!text-white' /> : 'Delete Instructor'}
                    </Button>
                </DialogActions>
            </Dialog >

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
