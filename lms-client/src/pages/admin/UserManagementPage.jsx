import RoleScreen from '../../components/StudentScreen'
import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar, CircularProgress, Pagination } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, PersonOutlined, Search, WarningAmber, VisibilityOutlined, RestoreFromTrash } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import api from '../../api/axiosClient'

export default function UserManagementPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const usersPerPage = 10

    const [activeTab, setActiveTab] = useState('active')
    const [archivedUsers, setArchivedUsers] = useState([])

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteLoading] = useState(false)

    const [openAddUser, setOpenAddUser] = useState(false)
    const [openEditUser, setOpenEditUser] = useState(false)
    const [openDeleteUser, setOpenDeleteUser] = useState(false)
    const [openViewUser, setOpenViewUser] = useState(false)

    const [selectedUser, setSelectedUser] = useState(false)

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('All')

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
        role: 'student',
        status: 'Active'
    })

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    const fetchArchivedUsers = useCallback(() => {
        return api.get('/users/accounts/archived', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => setArchivedUsers(response.data))
            .catch(error => {
                console.error('Error fetching archived users:', error)
                showNotification(error.response?.data?.message || 'Failed to retrieve archived users', 'error')
            })
    }, [showNotification])

    const restoreUser = async (id) => {
        try {
            await api.post(`/users/account/restore/${id}`, {}, getAuthConfig())
            showNotification('User restored successfully', 'success')
            await fetchUsers()
            await fetchArchivedUsers()
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to restore user', 'error')
        }
    }

    const requestFetchUsers = useCallback(() => {
        return api.get('/users/accounts', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(async (response) => {
            setUsers(response.data)

        }).catch((error) => {
            console.error('Error fetching users:', error)
            showNotification(error.response?.data?.message || 'Failed to retrieve users', 'error')
        }).finally(() => {
            setLoading(false)
        })
    }, [showNotification])

    const fetchUsers = async () => {
        setLoading(true)
        await requestFetchUsers()
    }

    useEffect(() => {
        requestFetchUsers()
        fetchArchivedUsers()
    }, [requestFetchUsers, fetchArchivedUsers])

    const validateInstructorForm = () => {
        const errors = {}
        const firstName = formData.firstName?.trim() || ''
        const lastName = formData.lastName?.trim() || ''
        const email = formData.email?.trim() || ''

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

        setFieldErrors(errors)

        return Object.keys(errors).length === 0
    }

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            role: 'student',
            status: 'Active'
        })
        setSelectedUser(null)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleAddUser = async () => {
        setFieldErrors({})
        if (!validateInstructorForm()) return

        setSaving(true)
        try {
            await api.post('/users/account/add', {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: formData.role.toLowerCase()
            }, getAuthConfig())

            setOpenAddUser(false)
            resetForm()
            showNotification('User added successfully!', 'success')

            fetchUsers()
        } catch (error) {
            console.error('Error adding user:', error)
            showNotification(error.response?.data?.message || 'Failed to add user', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateUser = async () => {
        const id = selectedUser?._id || selectedUser?.id
        if (!id) {
            showNotification('No user selected for update.', 'error')
            return
        }

        setFieldErrors({})
        if (!validateInstructorForm()) return
        try {
            setSaving(true)
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: formData.role.toLowerCase()
            }
            await api.put(`/users/account/update/${id}`, payload, getAuthConfig())
            setOpenEditUser(false)
            resetForm()
            showNotification('User updated successfully', 'success')
            await fetchUsers()
        } catch (error) {
            console.error('Error updating user:', error)
            showNotification(error.response?.data?.message || 'Failed to update user', 'error')
        }
    }

    const handleDeleteUser = async () => {
        const id = selectedUser?._id || selectedUser?.id
        if (!id) {
            showNotification('No user selected for deletion.', 'error')
            return
        }

        try {
            setSaving(true)

            await api.delete(`/users/account/delete/${id}`, getAuthConfig())

            setUsers(prev => prev.filter(user => user._id !== selectedUser._id))

            setOpenDeleteUser(false)
            setSelectedUser(null)
            showNotification('User deleted successfully', 'success')
        } catch (error) {
            console.error('Error deleting user:', error)
            showNotification(error.response?.data?.message || 'Failed to delete user', 'error')
        } finally {
            setSaving(false)
        }
    }

    const displayRole = (role) => {
        const roles = {
            admin: 'Administrator',
            instructor: 'Instructor',
            student: 'Student'
        }
        return roles[role?.toLowerCase()] || role || 'User'
    }

    const filteredUsers = useMemo(() => {
        const key = search.toLowerCase()
        return users.filter(user => {
            const firstName = user.firstName || ''
            const lastName = user.lastName || ''
            const email = user.email || ''

            const matchesSearch =
                firstName.toLowerCase().includes(key) ||
                lastName.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key)

            const matchesRole =
                roleFilter === 'All' || user.role?.toLowerCase() === roleFilter.toLowerCase()

            return matchesSearch && matchesRole
        })
    }, [users, search, roleFilter])

    const filteredArchivedUsers = useMemo(() => {
        const key = search.toLowerCase()
        return archivedUsers.filter(user => {
            const firstName = user.firstName || ''
            const lastName = user.lastName || ''
            const email = user.email || ''

            const matchesSearch =
                firstName.toLowerCase().includes(key) ||
                lastName.toLowerCase().includes(key) ||
                email.toLowerCase().includes(key)

            const matchesRole =
                roleFilter === 'All' || user.role?.toLowerCase() === roleFilter.toLowerCase()

            return matchesSearch && matchesRole
        })
    }, [archivedUsers, search, roleFilter])

    const displayedUsers = activeTab === 'active' ? filteredUsers : filteredArchivedUsers

    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(displayedUsers.length / usersPerPage)


    const initials = name =>
        name.replace('Prof. ', '').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()

    const roleClass = (role) => {
        if (role === 'admin' || role === 'Administrator') return '!bg-purple-50 !text-purple-700'
        if (role === 'instructor' || role === 'Instructor') return '!bg-blue-50 !text-blue-700'
        return '!bg-green-50 !text-green-700'
    }

    return (
        <RoleScreen page="usermanagementpage" role="admin">
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
                                    User Management
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Monitor user accounts, roles, and access credentials
                                </Typography>
                            </div>
                            <Button
                                variant='contained'
                                startIcon={<Add />}
                                onClick={() => {
                                    resetForm()
                                    setOpenAddUser(true)
                                }}
                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                            >
                                Add User
                            </Button>
                        </div>

                        {/* Top Stats */}
                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                            {[
                                ['Total Users', users.length],
                                ['Students', users.filter(user => user.role?.toLowerCase() === 'student').length,],
                                ['Instructors', users.filter(user => user.role?.toLowerCase() === 'instructor').length,],
                                ['Administrators', users.filter(user => user.role?.toLowerCase() === 'admin').length,],
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
                                        slotProps={{ input: {
                                            startAdornment: <Search className='!text-slate-400 !mr-2' />
                                        } }}
                                    />
                                    <TextField
                                        select
                                        size='small'
                                        label='Role'
                                        value={roleFilter}
                                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
                                    >
                                        <MenuItem value='All'>All Roles</MenuItem>
                                        <MenuItem value='admin'>Administrator</MenuItem>
                                        <MenuItem value='instructor'>Instructor</MenuItem>
                                        <MenuItem value='student'>Student</MenuItem>
                                    </TextField>
                                </div>

                                {/* Table */}
                                <div className='overflow-x-auto'>
                                    <table className='w-full min-w-[900px] text-sm'>
                                        <thead className='bg-slate-50 text-slate-500'>
                                            <tr>
                                                <th className='text-left font-semibold px-6 py-4'>Full Name</th>
                                                <th className='text-left font-semibold px-6 py-4'>Email</th>
                                                <th className='text-left font-semibold px-6 py-4'>Role</th>
                                                <th className='text-left font-semibold px-6 py-4'>Status</th>
                                                <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-100'>
                                            {currentUsers.map((user) => (
                                                <tr key={user._id || user.id} className='hover:bg-slate-50'>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <Avatar className='!bg-blue-600 !text-sm'>
                                                                {user.firstName?.charAt(0) || 'U'}
                                                                {user.lastName?.charAt(0) || ''}
                                                            </Avatar>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {user.firstName || ''} {user.lastName || ''}
                                                            </Typography>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {user.email || '—'}
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={user.role === "admin"
                                                                ? "Administrator"
                                                                : user.role === "student"
                                                                    ? "Student"
                                                                    : user.role === "instructor"
                                                                        ? "Instructor"
                                                                        : user.role
                                                            }
                                                            className={roleClass(displayRole(user.role))}
                                                        />
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <Chip
                                                            size='small'
                                                            label={user.status === "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                            }
                                                            className={
                                                                user.status === 'active'
                                                                    ? '!bg-green-50 !text-green-700'
                                                                    : '!bg-slate-100 !text-slate-600'
                                                            }
                                                        />
                                                    </td>
                                                    <td className='px-6 py-4'>
                                                        <div className='flex justify-end gap-1'>

                                                            <td className='px-6 py-4 text-right'>
                                                                {activeTab === 'archived' ? (
                                                                    <IconButton
                                                                        size='small'
                                                                        title='Restore'
                                                                        variant='outlined'
                                                                        onClick={() => restoreUser(user._id || user.id)}
                                                                    >
                                                                        <RestoreFromTrash fontSize='small' />
                                                                    </IconButton>
                                                                ) : (
                                                                    <div>
                                                                        <IconButton
                                                                            size='small'
                                                                            title='View'
                                                                            onClick={() => {
                                                                                setSelectedUser(user)
                                                                                setOpenViewUser(true)
                                                                            }}
                                                                        >
                                                                            <VisibilityOutlined fontSize='small' />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size='small'
                                                                            title='Edit'
                                                                            onClick={() => {
                                                                                setSelectedUser(user)
                                                                                setFormData({
                                                                                    firstName: user.firstName,
                                                                                    lastName: user.lastName,
                                                                                    email: user.email,
                                                                                    role: user.role,
                                                                                    status: user.status,
                                                                                })
                                                                                setOpenEditUser(true)
                                                                            }}
                                                                        >
                                                                            <EditOutlined fontSize='small' />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size='small'
                                                                            color='error'
                                                                            title='Delete'
                                                                            onClick={() => {
                                                                                setSelectedUser(user)
                                                                                setOpenDeleteUser(true)
                                                                            }}
                                                                        >
                                                                            <DeleteOutlined fontSize='small' />
                                                                        </IconButton>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {(activeTab === 'active'
                                        ? filteredUsers
                                        : archivedUsers.filter(
                                            user => {
                                                const matchesSearch =
                                                    `${user.firstName || ''} ${user.lastName || ''} `.toLowerCase().includes(search.toLowerCase()) ||
                                                    (user.email || '').toLowerCase().includes(search.toLowerCase())
                                                const matchesRole =
                                                    roleFilter === 'All' ||
                                                    user.role?.toLowerCase() === roleFilter.toLowerCase()
                                                return matchesSearch && matchesRole
                                            }
                                        )).length === 0 && (
                                            <div className='py-14 text-center'>
                                                <PersonOutlined className='!text-slate-300 !text-5xl' />
                                                <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                                    {loading ? 'Loading users...' : 'No users found'}
                                                </Typography>
                                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                                    Try changing your search or role filter.
                                                </Typography>
                                            </div>
                                        )}
                                </div>

                                {displayedUsers.length > 0 && (
                                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-slate-200'>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Showing {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
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

            <Dialog
                open={openViewUser}
                onClose={() => setOpenViewUser(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    User Details
                </DialogTitle>

                <DialogContent>
                    {selectedUser && (
                        <div className='space-y-5 pt-2'>
                            <div className='flex items-center gap-4'>
                                <Avatar src={selectedUser.avatar} alt={selectedUser.name} className='!bg-blue-600 !w-14 !h-14'>
                                    {initials(`${selectedUser.firstName} ${selectedUser.lastName}`)}
                                </Avatar>

                                <div>
                                    <Typography variant='h6' className='!font-semibold !text-slate-800'>
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </Typography>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Email
                                    </Typography>
                                    <Typography variant='body1' className='!font-medium !text-slate-800'>
                                        {selectedUser.email}
                                    </Typography>
                                </div>

                                <div>
                                    <Typography variant='body2' className='!text-slate-600'>
                                        Status
                                    </Typography>

                                    <div className='!mt-1'>
                                        <Chip
                                            size='small'
                                            label={selectedUser.status === 'active' ? 'Active' : 'Inactive'}
                                            className={
                                                selectedUser.status === 'active'
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
                        onClick={() => setOpenViewUser(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Add User Modal */}
            <Dialog
                open={openAddUser}
                onClose={() => setOpenAddUser(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Add User
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
                            label='Role'
                            name='role'
                            value={formData.role}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.role)}
                            helperText={fieldErrors.role}
                        >
                            <MenuItem value='student'>Student</MenuItem>
                            <MenuItem value='instructor'>Instructor</MenuItem>
                            <MenuItem value='admin'>Administrator</MenuItem>
                        </TextField>
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setOpenAddUser(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleAddUser}
                        disabled={saving}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Add User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog
                open={openEditUser}
                onClose={() => setOpenEditUser(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Edit User
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
                            label='Role'
                            name='role'
                            value={formData.role}
                            onChange={handleFormChange}
                            error={Boolean(fieldErrors.role)}
                            helperText={fieldErrors.role}
                        >
                            <MenuItem value='student'>Student</MenuItem>
                            <MenuItem value='instructor'>Instructor</MenuItem>
                            <MenuItem value='admin'>Administrator</MenuItem>
                        </TextField>
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setOpenEditUser(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleUpdateUser}
                        disabled={saving}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? <CircularProgress size={20} className='!text-white' /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openDeleteUser}
                onClose={() => setOpenDeleteUser(false)}
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
                            Delete User Account?
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-2 !leading-6'>
                            Are you sure you want to delete this account?
                        </Typography>

                        {selectedUser && (
                            <div className='w-full mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3'>
                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </Typography>

                                <Typography variant='caption' className='!text-slate-500'>
                                    {selectedUser.email}
                                </Typography>

                                <div>
                                    <Chip
                                        size='small'
                                        label={displayRole(selectedUser.role)}
                                        className={roleClass(
                                            displayRole(selectedUser.role)
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        <Typography variant='caption' className='!text-slate-500 !mt-4'>
                            This action cannot be undone
                        </Typography>
                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-6 !pt-4 !justify-center !gap-2'>
                    <Button
                        onClick={() => setOpenDeleteUser(false)}
                        disabled={deleteLoading}
                        variant='outlined'
                        className='!normal-case !rounded-lg !border-slate-300 !text-slate-600 hover:!bg-slate-50 !px-5'
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleDeleteUser}
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