import { Card, CardContent, Typography, Button, FormControl, InputLabel, MenuItem, Select, TextField, Alert, Snackbar } from '@mui/material'
import { SaveOutlined, SchoolOutlined, ArrowBack } from '@mui/icons-material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'

export default function CreateCoursePage() {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        courseCode: '',
        courseName: '',
        instructor: 'Instructor Portal',
        units: 3,
        semester: '1st Semester',
        schedule: '',
        room: '',
        startDate: '',
        endDate: '',
        description: ''
    })

    const updateField = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.courseCode.trim() || !form.courseName.trim()) {
            setError('Please enter both course code and name')
            return
        }
        try {
            setLoading(true)
            setError('')
            await api.post('/courses/create', form)
            navigate('/instructor/courses')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/instructor/courses')}
                        className='!normal-case !text-slate-600 !mb-4'
                    >
                        Back to Courses
                    </Button>
                    <div className='mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Create Course
                        </Typography>
                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Add a new course to your curriculum.
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-6 sm:!p-8'>
                                <div className='flex items-center gap-3 mb-6'>
                                    <div className='w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                                        <SchoolOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Course Information
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Enter the required details
                                        </Typography>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    <TextField
                                        required
                                        fullWidth
                                        name='courseCode'
                                        label='Course Code'
                                        placeholder='e.g. IT 301'
                                        value={form.courseCode}
                                        onChange={updateField}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        name='courseName'
                                        label='Course Name'
                                        placeholder='e.g. Web Development'
                                        value={form.courseName}
                                        onChange={updateField}
                                    />
                                    <FormControl fullWidth required>
                                        <InputLabel>Units</InputLabel>
                                        <Select
                                            name='units'
                                            value={form.units}
                                            label='Units'
                                            onChange={updateField}
                                        >
                                            {[1, 2, 3, 4].map(u => (
                                                <MenuItem key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth required>
                                        <InputLabel>Semester</InputLabel>
                                        <Select
                                            name='semester'
                                            value={form.semester}
                                            label='Semester'
                                            onChange={updateField}
                                        >
                                            <MenuItem value='1st Semester'>1st Semester</MenuItem>
                                            <MenuItem value='2nd Semester'>2nd Semester</MenuItem>
                                            <MenuItem value='Summer Term'>Summer Term</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        name='room'
                                        label='Room'
                                        placeholder='e.g. Room 301'
                                        value={form.room}
                                        onChange={updateField}
                                    />
                                    <TextField
                                        fullWidth
                                        name='schedule'
                                        label='Schedule'
                                        placeholder='e.g. Mon / Wed 8:00 AM - 10:00 AM'
                                        value={form.schedule}
                                        onChange={updateField}
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        name='description'
                                        label='Course Description'
                                        value={form.description}
                                        onChange={updateField}
                                        className='md:!col-span-2'
                                    />
                                    <div className='md:col-span-2 flex justify-end gap-3 mt-2'>
                                        <Button
                                            type='submit'
                                            variant='contained'
                                            disabled={loading}
                                            startIcon={<SaveOutlined />}
                                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                        >
                                            {loading ? 'Creating...' : 'Create Course'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </main>
            </div>

            <Snackbar open={Boolean(error)} autoHideDuration={4000} onClose={() => setError('')}>
                <Alert onClose={() => setError('')} severity='error' variant='filled'>
                    {error}
                </Alert>
            </Snackbar>
        </div>
    )
}