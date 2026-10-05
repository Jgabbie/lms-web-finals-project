import { Avatar, Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Chip, TextField, } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, PersonOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'

export default function ActivityLogs() {
    const [search, setSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [openAddInstructor, setOpenAddInstructor] = useState(false)

    const instructors = [
        {
            id: 1,
            userId: 'INS-001',
            name: 'Prof. 001',
            email: 'prof001@gmail.com',
            department: 'Information Technology',
            specialization: 'Web Development',
            courses: 3,
            status: 'Active'
        },
        {
            id: 2,
            userId: 'INS-001',
            name: 'Prof. 001',
            email: 'prof001@gmail.com',
            department: 'Information Technology',
            specialization: 'Web Development',
            courses: 3,
            status: 'Active'
        },
        {
            id: 3,
            userId: 'INS-001',
            name: 'Prof. 001',
            email: 'prof001@gmail.com',
            department: 'Information Technology',
            specialization: 'Web Development',
            courses: 3,
            status: 'Active'
        },
        {
            id: 4,
            userId: 'INS-001',
            name: 'Prof. 001',
            email: 'prof001@gmail.com',
            department: 'Information Technology',
            specialization: 'Web Development',
            courses: 3,
            status: 'Active'
        },
    ]

    const filteredInstructors = useMemo(() => {
        const key = search.toLowerCase()
        return instructors.filter(instructor => {
            const matchesSearch =
                instructor.name.toLowerCase().includes(key) ||
                instructor.email.toLowerCase().includes(key) ||
                instructor.instructorId.toLowerCase().includes(key) ||
                instructor.specialization.toLowerCase().includes(key)

            const matchesDepartment =
                departmentFilter === 'All' || instructor.department === departmentFilter
            const matchesStatus =
                statusFilter === 'All' || instructor.status === statusFilter

            return matchesSearch && matchesDepartment && matchesStatus
        })
    }, [search, statusFilter, departmentFilter])

    const initials = name =>
        name.replace('Prof. ', '').split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
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
                            onClick={() => setOpenAddInstructor(true)}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Add Instructor
                        </Button>
                    </div>


                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        {[
                            ['Total Instructors', instructors.length],
                            ['Active', instructors.filter(instructor => instructor.status === 'Student').length,],
                            ['Inactive', instructors.filter(instructor => instructor.status === 'Instructor').length,],
                            ['Assigned Courses', instructors.reduce((sum, instructor) => sum + instructor.courses, 0)],
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
                            <div className='grid grid-cols-1 lg:grid-cols-[1fr_2400px_200px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search name, email, instructor ID or specialization...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
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
                                    <MenuItem value='Active'>Active</MenuItem>
                                    <MenuItem value='Inactive'>Inactive</MenuItem>
                                </TextField>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[1000px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Instructor</th>
                                            <th className='text-left font-semibold px-6 py-4'>Department</th>
                                            <th className='text-left font-semibold px-6 py-4'>Specialization</th>
                                            <th className='text-left font-semibold px-6 py-4'>Courses</th>
                                            <th className='text-left font-semibold px-6 py-4'>Status</th>
                                            <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredInstructors.map(instructor => (
                                            <tr key={instructor.id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <Avatar className='!bg-blue-600'>
                                                            {initials(instructor.name)}
                                                        </Avatar>

                                                        <div>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {instructor.name}
                                                            </Typography>
                                                            <Typography variant='caption' className='!text-slate-500'>
                                                                {instructor.userId}
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
                                                        label={`${instructor.courses} course${instructor.courses > 1 ? 's' : ''}`}
                                                        className='!bg-blue-50 !text-blue-700'
                                                    />
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={instructor.status}
                                                        className={
                                                            instructor.status === 'Active'
                                                                ? '!bg-green-50 !text-green-700'
                                                                : '!bg-slate-100 !text-slate-600'
                                                        }
                                                    />
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <div className='flex justify-end gap-1'>
                                                        <IconButton size='small' title='View'>
                                                            <VisibilityOutlined fontSize='small' />
                                                        </IconButton>
                                                        <IconButton size='small' title='Edit'>
                                                            <EditOutlined fontSize='small' />
                                                        </IconButton>
                                                        <IconButton size='small' color='error' title='Delete'>
                                                            <DeleteOutlined fontSize='small' />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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
                        <TextField fullWidth label='First Name' />
                        <TextField fullWidth label='Last Name' />
                        <TextField fullWidth label='Instructor ID' placeholder='e.g. INS-005' />
                        <TextField fullWidth label='Email Address' type='email' />

                        <TextField
                            select
                            fullWidth
                            label='Department'
                            defaultValue='Infomation Technology'
                        >
                            <MenuItem value='Information Technology'>Information Technology</MenuItem>
                            <MenuItem value='Computer Science'>Computer Science</MenuItem>
                            <MenuItem value='Information Systems'>Information Systems</MenuItem>
                        </TextField>

                        <TextField fullWidth label='Specialization' placeholder='e.g. Web Development' />

                        <TextField
                            select
                            fullWidth
                            label='Status'
                            defaultValue='Active'
                        >
                            <MenuItem value='Active'>Active</MenuItem>
                            <MenuItem value='Inactive'>Inactive</MenuItem>
                        </TextField>

                        <TextField fullWidth label='Temporary Password' placeholder='password' />
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
                        onClick={() => setOpenAddInstructor(false)}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Add Instructor
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
