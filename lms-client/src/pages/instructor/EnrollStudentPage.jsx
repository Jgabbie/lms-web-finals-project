import { Avatar, Card, CardContent, Typography, Button, FormControl, InputLabel, MenuItem, Select, Checkbox, Chip, TextField } from '@mui/material'
import { GroupAddOutlined, Search, SchoolOutlined, } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import Navbar from '../../components/Navbar'

export default function EnrollStudentPage() {

    const [course, setCourse] = useState('')
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])

    const students = [
        { id: 1, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year' },
        { id: 2, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year' },
        { id: 3, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year' },
        { id: 4, studentId: '2026-82173', name: 'John Cruz', email: 'john.cruz@gmail.com', program: 'BSIT', year: '3rd Year' },

    ]

    const filteredStudents = useMemo(() => {
        const key = search.toLowerCase()
        return students.filter(student =>
            student.name.toLowerCase().includes(key) ||
            student.studentId.toLowerCase().includes(key) ||
            student.email.toLowerCase().includes(key)
        )
    }, [search])


    const toggleStudent = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id)
            : [...prev, id]
        )
    }

    const handleEnroll = () => {
        console.log('Enroll: ', { course, students: selected })
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Enroll Student
                        </Typography>
                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Select a course and enroll one or more students
                        </Typography>
                    </div>


                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-6 '>
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4'>

                                <FormControl
                                    fullWidth
                                >
                                    <InputLabel>
                                        Course
                                    </InputLabel>
                                    <Select
                                        value={course}
                                        label='Course'
                                        onChange={e => setCourse(e.target.value)}
                                    >
                                        <MenuItem value='IT 301'>IT 301 - Web Development</MenuItem>
                                        <MenuItem value='IT 301'>IT 301 - Web Development</MenuItem>
                                        <MenuItem value='IT 301'>IT 301 - Web Development</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    placeholder='Search Students'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
                                />

                                <Button
                                    variant='contained'
                                    startIcon={<GroupAddOutlined />}
                                    disabled={!course || selected.length === 0}
                                    onClick={handleEnroll}
                                    className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none !px-6'
                                >
                                    Enroll ({selected.length})
                                </Button>
                            </div>
                        </CardContent>
                    </Card>


                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-0 '>
                            <div className='flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-200'>

                                <div>
                                    <Typography variant='h6' className='!font-bold !text-slate-800'>
                                        Available Students
                                    </Typography>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        {filteredStudents.length} students found
                                    </Typography>
                                </div>

                                <Chip
                                    icon={<SchoolOutlined />}
                                    label={`${selected.length} selected`}
                                    className='!bg-blue-50 !text-blue-700'
                                />
                            </div>


                            <div className='divide-y divide-slate-100'>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(student => (
                                        <div
                                            key={student.id}
                                            className='flex items-start sm:items-center gap-3 sm:gap-4 sm:px-6 py-4 hover:bg-slate-50'
                                        >
                                            <Checkbox
                                                checked={selected.includes(student.id)}
                                                onChange={() => toggleStudent(student.id)}
                                            />

                                            <Avatar className='!bg-blue-600'>
                                                {student.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                                            </Avatar>

                                            <div className='flex-1 min-w-0'>
                                                <Typography className='!font-semibold !text-slate-800'>
                                                    {student.name}
                                                </Typography>
                                                <Typography variant='body2' className='!text-slate-500'>
                                                    {student.studentId}
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-400 break-all'>
                                                    {student.email}
                                                </Typography>

                                                <div className='flex gap-2'>
                                                    <Chip size='small' label={student.program} />
                                                    <Chip size='small' label={student.year} variant='outlined' />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='py-14 px-6 text-center'>
                                        <SchoolOutlined className='!text-slate-300 !text-5xl' />

                                        <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                            No students found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </main >
            </div >
        </>
    )
}
