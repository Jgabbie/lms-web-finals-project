import { Card, CardContent, Typography, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { SaveOutlined, SchoolOutlined } from '@mui/icons-material'
import { useState } from 'react'
import Navbar from '../../components/Navbar'

export default function CreateCoursePage() {

    const [form, setForm] = useState({
        courseCode: '', courseName: '', instructor: '', units: '', semester: '', schedule: '', room: '', startDate: '', endDate: '', description: ''
    })

    const updateField = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const clearForm = () => setForm({
        courseCode: '', courseName: '', instructor: '', units: '', semester: '', schedule: '', room: '', startDate: '', endDate: '', description: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Create course: ', form)
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Create Course
                        </Typography>
                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Add a new course to the learning management system.
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
                                            Enter the required course details
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

                                    <FormControl
                                        fullWidth
                                        required
                                    >
                                        <InputLabel>
                                            Instructor
                                        </InputLabel>
                                        <Select
                                            name='instructor'
                                            value={form.instructor}
                                            label='Instructor'
                                            onChange={updateField}
                                        >
                                            <MenuItem value='Prof. dhqwuidhwqiudqw'>Prof.dnwqhduiqwd</MenuItem>
                                            <MenuItem value='Prof. dhqwuidhwqiudqw'>Prof.dnwqhduiqwd</MenuItem>
                                            <MenuItem value='Prof. dhqwuidhwqiudqw'>Prof.dnwqhduiqwd</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl
                                        fullWidth
                                        required
                                    >
                                        <InputLabel>
                                            Units
                                        </InputLabel>
                                        <Select
                                            name='units'
                                            value={form.units}
                                            label='Units'
                                            onChange={updateField}
                                        >
                                            {[1, 2, 3, 4].map(unit => (
                                                <MenuItem key={unit} value={unit}>{unit} Unit {unit > 1 ? 's' : ''}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>


                                    <FormControl
                                        fullWidth
                                        required
                                    >
                                        <InputLabel>
                                            Semester
                                        </InputLabel>
                                        <Select
                                            name='semester'
                                            value={form.semester}
                                            label='Semester'
                                            onChange={updateField}
                                        >
                                            <MenuItem value='1st Semester'>1st Semester</MenuItem>
                                            <MenuItem value='1st Semester'>1st Semester</MenuItem>
                                            <MenuItem value='1st Semester'>1st Semester</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        name='room'
                                        label='Room'
                                        placeholder='Computer Laboratory'
                                        value={form.room}
                                        onChange={updateField}
                                    />

                                    <TextField
                                        fullWidth
                                        name='schedule'
                                        label='Schedule'
                                        placeholder='Monday / Wednesday, 1:00 PM - 2:30 PM'
                                        value={form.schedule}
                                        onChange={updateField}
                                    />

                                    <TextField
                                        fullWidth
                                        name='startDate'
                                        label='Start Date'
                                        type='date'
                                        value={form.startDate}
                                        onChange={updateField}
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <TextField
                                        fullWidth
                                        name='endDate'
                                        label='End Date'
                                        type='date'
                                        value={form.endDate}
                                        onChange={updateField}
                                        InputLabelProps={{ shrink: true }}
                                    />

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={5}
                                        name='description'
                                        label='Course Description'
                                        placeholder='Enter the course description and overview...'
                                        value={form.description}
                                        onChange={updateField}
                                        className='md:!col-span-2'
                                    />

                                    <div className='md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2'>
                                        <Button
                                            type='button'
                                            variant='outlined'
                                            onClick={clearForm}
                                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                        >
                                            Clear
                                        </Button>

                                        <Button
                                            type='submit'
                                            variant='contained'
                                            startIcon={<SaveOutlined />}
                                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                        >
                                            Create Course
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </main >
            </div >
        </>
    )
}
