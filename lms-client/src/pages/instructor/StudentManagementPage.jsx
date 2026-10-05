import { Avatar, Card, CardContent, Typography, Button, MenuItem, Chip, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Add, DeleteOutlined, EditOutlined, Search, VisibilityOutlined } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'

export default function StudentManagementPage() {

    const [search, setSearch] = useState('')
    const [program, setProgram] = useState('All')
    const [open, setOpen] = useState(false)

    const students = [
        { id: 1, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year', status: 'Active', courses: 5 },
        { id: 2, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year', status: 'Active', courses: 5 },
        { id: 3, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year', status: 'Active', courses: 5 },
        { id: 4, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year', status: 'Active', courses: 5 },
    ]

    const filteredStudents = useMemo(() => {
        const key = search.toLowerCase()
        return students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(key) ||
                student.studentId.toLowerCase().includes(key) ||
                student.email.toLowerCase().includes(key)

            const matchesProgram =
                program === 'All' || student.program === program

            return matchesSearch && matchesProgram
        })
    }, [search, program])


    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div >
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Student Management
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View, add , edit, and manage registered students.
                            </Typography>
                        </div>

                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={() => setOpen(true)}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Add Student
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        {[
                            ['Total Students', students.length],
                            ['Active Students', students.filter(item => item.status === 'Active').length],
                            ['Inactive Students', students.filter(item => item.status === 'Inactive').length],
                        ].map(([label, value]) => (
                            <Card
                                key={label}
                                className='!rounded-xl !border !border-slate-200 !shadow-sm'
                            >
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
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search by name, students ID, or email...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
                                />

                                <TextField
                                    select
                                    size='small'
                                    label='Program'
                                    value={program}
                                    onChange={e => setProgram(e.target.value)}
                                >
                                    <MenuItem value='All'>All</MenuItem>
                                    <MenuItem value='BSIT'>BSIT</MenuItem>
                                    <MenuItem value='BSCS'>BSCS</MenuItem>
                                    <MenuItem value='BSIS'>BSIS</MenuItem>
                                </TextField>
                            </div>

                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[900px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Student
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Program
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Year
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Courses
                                            </th>
                                            <th className='text-left font-semibold px-6 py-4'>
                                                Status
                                            </th>
                                            <th className='text-right font-semibold px-6 py-4'>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredStudents.map(student => (
                                            <tr key={student.id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <Avatar className='!bg-blue-600'>
                                                            {student.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                                                        </Avatar>

                                                        <div>
                                                            <Typography className='!font-semibold !text-slate-800'>
                                                                {student.name}
                                                            </Typography>
                                                            <Typography variant='caption' className='!text-slate-500'>
                                                                {student.studentId}
                                                            </Typography>

                                                            <Typography variant='caption' className='!text-slate-400'>
                                                                {student.email}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className='px-6 py-4 text-slate-600'>
                                                    {student.program}
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>
                                                    {student.year}
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>
                                                    {student.courses}
                                                </td>

                                                <td className='px-6 py-4'>
                                                    <Chip
                                                        size='small'
                                                        label={student.status}
                                                        className={
                                                            student.status === 'Active'
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

                                {filteredStudents.length === 0 && (
                                    <div className='py-12 text-center'>
                                        <Typography className='!font-semibold !text-slate-700'>
                                            No students found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search or program filter
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main >
            </div >

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Add Student
                </DialogTitle>

                <DialogContent>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2'>
                        <TextField fullWidth label='Student ID' />
                        <TextField fullWidth label='Full Name' />
                        <TextField fullWidth label='Email Address' type='email' />

                        <TextField select fullWidth label='Program' defaultValue='BSIT'>
                            <MenuItem value='BSIT'>BSIT</MenuItem>
                            <MenuItem value='BSCS'>BSCS</MenuItem>
                            <MenuItem value='BSIS'>BSIS</MenuItem>
                        </TextField>

                        <TextField select fullWidth label='Year Level' defaultValue='1st Year'>
                            <MenuItem value='1st Year'>1st Year</MenuItem>
                            <MenuItem value='2nd Year'>2nd Year</MenuItem>
                            <MenuItem value='3rd Year'>3rd Year</MenuItem>
                            <MenuItem value='4th Year'>4th Year</MenuItem>
                        </TextField>
                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpen(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>

                    <Button
                        variant='contained'
                        onClick={() => setOpen(false)}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !shadow-none'
                    >
                        Add Student
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
