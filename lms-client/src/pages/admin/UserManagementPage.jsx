import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, Alert, Snackbar } from '@mui/material'
import { Add, Delete, DeleteOutlined, EditOutlined, KeyboardReturnSharp, PersonOutlined, Search, VisibilityOutlined, WarningAmber } from '@mui/icons-material'
import { useState, useMemo, useEffect, useCallback } from 'react'
import NavbarAdmin from '../../components/NavbarAdmin'
import SidebarAdmin from '../../components/SidebarAdmin'
import axios from 'axios'

export default function UserManagementPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [openAddUser, setOpenAddUser] = useState(false)
    const [openEditUser, setOpenEditUser] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [userToDelete, setUserToDelete] = useState(false)

    const [sidebarOpen, setSidebarOpen] = useState(true)

    const [selectedUser, setSelectedUser] = useState(false)
    const [roleFilter, setRoleFilter] = useState('All')
    const [message, setMessage] = useState('')
    const [search, setSearch] = useState('')
    const [error, setError] = useState('')

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

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const response = await axios.get('http://localhost:5000/api/user/accounts', getAuthConfig())
            if (Array.isArray(response.data)) {
                setUsers(response.data)
            } else if (Array.isArray(response.data?.users)) {
                setUsers(response.data.users)
            } else if (Array.isArray(response.data?.data)) {
                setUsers(response.data.data)
            } else {
                setUsers([])
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve users')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

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
    }

    const handleAddUser = async () => {
        try {
            setError('')
            if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
                setError('Please complete all required fields')
                return
            }
            await axios.post('http://localhost:5000/api/user/account/add', {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: formData.role.toLowerCase()
            }, getAuthConfig())

            setOpenAddUser(false)
            resetForm()
            setMessage('User added successfully')
            await fetchUsers()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user')
        }
    }

    const handleOpenEdit = async (id) => {
        try {
            setError('')
            if (!id) return
            const response = await axios.get(`http://localhost:5000/api/user/account/${id}`, getAuthConfig())
            const user = response.data
            setSelectedUser(user)
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                role: user.role || 'student',
                status: user.status || 'Active'
            })
            setOpenEditUser(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to retrieve user')
        }
    }

    const handleUpdateUser = async () => {
        const id = selectedUser?._id || selectedUser?.id
        if (!id) {
            setError('User ID is missing')
            return
        }
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setError('Please complete all required fields')
            return
        }
        try {
            setError('')
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: formData.role.toLowerCase()
            }
            await axios.put(`http://localhost:5000/api/user/account/update/${id}`, payload, getAuthConfig())
            setOpenEditUser(false)
            resetForm()
            setMessage('User updated successfully')
            await fetchUsers()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user')
        }
    }

    const handleOpenDelete = (user) => {
        setUserToDelete(user)
        setOpenDeleteDialog(true)
    }

    const handleCloseDelete = () => {
        if (deleteLoading) return

        setOpenDeleteDialog(false)
        setUserToDelete(null)
    }

    const handleDeleteUser = async (id) => {
        try {
            setError('')
            await axios.delete(`http://localhost:5000/api/user/account/delete/${id}`, getAuthConfig())

            setUsers(prev => prev.filter(user => user._id !== userToDelete._id))

            setOpenDeleteDialog(false)
            setUserToDelete(null)
            setMessage('User deleted successfully')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user')
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

    const roleClass = (role) => {
        if (role === 'admin' || role === 'Administrator') return '!bg-purple-50 !text-purple-700'
        if (role === 'instructor' || role === 'Instructor') return '!bg-blue-50 !text-blue-700'
        return '!bg-green-50 !text-green-700'
    }

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
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
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
                                        label='Role'
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
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
                                            {filteredUsers.map((user, idx) => (
                                                <tr key={user._id || user.id || idx} className='hover:bg-slate-50'>
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
                                                            <IconButton
                                                                size='small'
                                                                title='Edit'
                                                                onClick={() => handleOpenEdit(user._id || user.id)}
                                                            >
                                                                <EditOutlined fontSize='small' />
                                                            </IconButton>
                                                            <IconButton
                                                                size='small'
                                                                color='error'
                                                                title='Delete'
                                                                onClick={() => handleOpenDelete(user)}
                                                            >
                                                                <DeleteOutlined fontSize='small' />
                                                            </IconButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {filteredUsers.length === 0 && (
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
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>

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
                            label='Role'
                            name='role'
                            value={formData.role}
                            onChange={handleFormChange}
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
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Add User
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
                            label='Role'
                            name='role'
                            value={formData.role}
                            onChange={handleFormChange}
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
                            Delete User Account?
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-2 !leading-6'>
                            Are you sure you want to delete this account?
                        </Typography>

                        {userToDelete && (
                            <div className='w-full mt-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3'>
                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                    {userToDelete.firstName} {userToDelete.lastName}
                                </Typography>

                                <Typography variant='caption' className='!text-slate-500'>
                                    {userToDelete.email}
                                </Typography>

                                <div>
                                    <Chip
                                        size='small'
                                        label={displayRole(userToDelete.role)}
                                        className={roleClass(
                                            displayRole(userToDelete.role)
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
                        onClick={handleCloseDelete}
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