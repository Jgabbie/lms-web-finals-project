import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar, CircularProgress } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, PersonOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo, useEffect } from 'react'
import api from '../../api/axiosClient'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'

export default function ActivityLogs() {
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

    const [openAddInstructor, setOpenAddInstructor] = useState(false)
    const [openEditInstructor, setOpenEditInstructor] = useState(false)
    const [openDeleteInstructor, setOpenDeleteInstructor] = useState(false)
    const [openViewInstructor, setOpenViewInstructor] = useState(false)
    const [selectedInstructor, setSelectedInstructor] = useState(null)

    const [sidebarOpen, setSidebarOpen] = useState(true)

    const [instructors, setInstructors] = useState([])
    const [loading, setLoading] = useState(true)
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        })
    }

    const closeNotification = (_, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setNotification({ ...notification, open: false })
    }

    const emptyForm = {
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        specialization: '',
        status: 'active',
    }

    const [formData, setFormData] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const fetchInstructors = async () => {
        try {
            setLoading(true)

            const response = await api.get('/instructors/instructors')
            setInstructors(response.data)
        } catch (error) {
            console.error('Error fetching instructors:', error)
            showNotification(
                'Failed to fetch instructors. Please try again later.',
                'error'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInstructors()
    }, [])

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddInstructor = async () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.specialization) {
            showNotification('Please fill in all required fields.', 'error')
            return
        }

        try {
            setSaving(true)

            await api.post('/instructors/add/instructors', formData)
            showNotification('Instructor added successfully!', 'success')

            setFormData(emptyForm)
            setOpenAddInstructor(false)
            await fetchInstructors()
        } catch (error) {
            console.error('Error adding instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to add instructor.', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleEditInstructor = async () => {
        if (!selectedInstructor) return

        try {
            setSaving(true)

            await api.put(`/instructors/update/instructors/${selectedInstructor._id}`, formData)

            setOpenEditInstructor(false)
            setSelectedInstructor(null)

            await fetchInstructors()

        } catch (error) {
            console.error('Error editing instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to edit instructor.', 'error')
        } finally {
            setSaving(false)
        }
    }


    const handleDeleteInstructor = async () => {
        if (!selectedInstructor?._id) return

        try {
            setSaving(true)

            await api.delete(`/instructors/delete/instructors/${selectedInstructor._id}`)
            setOpenDeleteInstructor(false)
            setSelectedInstructor(null)

            await fetchInstructors()
        } catch (error) {
            console.error('Error deleting instructor:', error)
            showNotification(error.response?.data?.message || 'Failed to delete instructor.', 'error')
        } finally {
            setSaving(false)
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

    const initials = name =>
        name.replace('Prof. ', '').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()

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
                                    setFormData(emptyForm)
                                    setOpenAddInstructor(true)
                                }}
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Add Instructor
                            </Button>
                        </div>


                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
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


                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-0'>
                                <div className='grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3 p-5 border-b border-slate-200'>
                                    <TextField
                                        size='small'
                                        placeholder='Search name, email, instructor ID or specialization...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
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
                                        onChange={(e) => setStatusFilter(e.target.value)}
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
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className='px-6 py-4 text-center'>
                                                        <CircularProgress size={24} className='!text-blue-600' />
                                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                                            Loading instructors...
                                                        </Typography>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredInstructors.map(instructor => (
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

                                                        <td className='px-6 py-4'>
                                                            <div className='flex justify-end gap-1'>
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
                                                        </td>
                                                    </tr>
                                                ))
                                            )}

                                        </tbody>
                                    </table>

                                    {filteredInstructors.length === 0 && (
                                        <div className='py-14 text-center'>
                                            <PersonOutlined className='!text-slate-300 !text-5xl' />
                                            <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                                No instructors found
                                            </Typography>
                                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                                Try changing your search or filters.
                                            </Typography>
                                        </div>
                                    )}
                                </div>
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
                            select
                            fullWidth
                            label='Department'
                            name='department'
                            value={formData.department}
                            onChange={handleFormChange}
                        >
                            <MenuItem value='Information Technology'>Information Technology</MenuItem>
                            <MenuItem value='Computer Science'>Computer Science</MenuItem>
                            <MenuItem value='Information Systems'>Information Systems</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label='Specialization'
                            placeholder='e.g. Web Development'
                            name='specialization'
                            value={formData.specialization}
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
                            select
                            fullWidth
                            label='Department'
                            name='department'
                            value={formData.department}
                            onChange={handleFormChange}
                        >
                            <MenuItem value='Information Technology'>Information Technology</MenuItem>
                            <MenuItem value='Computer Science'>Computer Science</MenuItem>
                            <MenuItem value='Information Systems'>Information Systems</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label='Specialization'
                            placeholder='e.g. Web Development'
                            name='specialization'
                            value={formData.specialization}
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
                    <Button
                        onClick={() => setOpenEditInstructor(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleEditInstructor}
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
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenDeleteInstructor(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        color='error'
                        onClick={handleDeleteInstructor}
                        disabled={saving}
                        className='!normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Delete'}
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
        </>
    )
}
