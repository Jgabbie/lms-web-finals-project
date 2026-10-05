import { Card, CardContent, Typography, Button, Chip, Divider, TextField, LinearProgress } from '@mui/material'
import { ArrowBack, CalendarToday, AccessTime, AttachFile, CloudUpload, InsertDriveFile, CheckCircle, AssignmentTurnedIn } from '@mui/icons-material'
import { useState } from 'react'
import Navbar from '../../components/Navbar'

export default function AssignmentDetailsPage() {
    const [selectedFile, setsSelectedFile] = useState(null)
    const [comment, setComment] = useState('')

    const assignment = {
        title: 'React Component Development',
        course: 'Web Development Fundaments',
        instructor: 'Mr. AAA',
        dueDate: 'September 30, 2026',
        dueTime: '11:59 PM',
        points: 100,
        status: 'To Do',
        description: 'jdwiqodjoqwidhwid',
        instructions: [
            'djqwhiudwqd',
            'dhwuqihdiuqwdi',
            'djqwhiudwqd',
            'dhwuqihdiuqwdi',
            'djqwhiudwqd',
            'dhwuqihdiuqwdi',
        ],
        attachment: {
            name: 'Assignment_Guidelines.pdf',
            size: '284 KB'
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) setsSelectedFile(file)
    }

    const handleSubmit = () => {
        if (!selectedFile) return
        alert('Assignment submitted successfully')
    }

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <Button
                        startIcon={<ArrowBack />}
                        className='!normal-case !text-slate-600 !mb-5'
                        onClick={() => window.history.back()}
                    >
                        Back to Assignments
                    </Button>

                    <div className='flex flex-col lg:flex-row gap-6'>
                        <div className='flex-1 min-w-0'>
                            <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-6 sm:!p-8'>
                                    <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                                        <div>
                                            <Typography variant='body2' className='!text-blue-600 !font-semibold !mb-2'>
                                                {assignment.course}
                                            </Typography>

                                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                                {assignment.title}
                                            </Typography>

                                            <Typography variant='body2' className='!text-slate-500 !mt-2'>
                                                Assigned by {assignment.instructor}
                                            </Typography>
                                        </div>

                                        <Chip
                                            label={assignment.status}
                                            className='!bg-amber-100 !text-amber-700 !font-semibold'
                                        />
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7'>
                                        <div className='flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4'>
                                            <div className='w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'>
                                                <CalendarToday fontSize='small' />
                                            </div>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Due Date
                                                </Typography>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {assignment.dueDate}
                                                </Typography>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4'>
                                            <div className='w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'>
                                                <AccessTime fontSize='small' />
                                            </div>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Due Time
                                                </Typography>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {assignment.dueTime}
                                                </Typography>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4'>
                                            <div className='w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center'>
                                                <AssignmentTurnedIn fontSize='small' />
                                            </div>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    Points
                                                </Typography>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {assignment.points} points
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>

                                    <Divider className='!my-7' />

                                    <section>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 !mb-2'>
                                            Assignment Description
                                        </Typography>
                                        <Typography variant='caption' className='!text-slate-600 !leading-7'>
                                            {assignment.description}
                                        </Typography>
                                    </section>

                                    <section className='mt-7'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 !mb-3'>
                                            Instructions
                                        </Typography>
                                        <ol className='list-decimal pl-5 space-y-2 text-slate-600'>
                                            {assignment.instructions.map((instruction, index) => (
                                                <li key={index} className='pl-1 leading-6'>
                                                    {instruction}
                                                </li>
                                            ))}
                                        </ol>
                                    </section>

                                    <section className='mt-7'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 !mb-3'>
                                            Assignment Attachment
                                        </Typography>
                                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50'>
                                            <div className='flex items-center gap-3 min-w-0'>
                                                <div className='w-11 h-11 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0'>
                                                    <InsertDriveFile />
                                                </div>
                                                <div className='min-w-0'>
                                                    <Typography variant='body2' className='!font-semibold !text-slate-800 truncate'>
                                                        {assignment.attachment.name}
                                                    </Typography>
                                                    <Typography variant='caption' className='!text-slate-500'>
                                                        PDF {assignment.attachment.size}
                                                    </Typography>
                                                </div>
                                            </div>

                                            <Button
                                                variant='outlined'
                                                startIcon={<AttachFile />}
                                                className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                onClick={() => window.history.back()}
                                            >
                                                View File
                                            </Button>
                                        </div>
                                    </section>
                                </CardContent>
                            </Card>
                        </div>

                        <div className='w-full lg:w-96 shrink-0'>
                            <Card className='!rounded-xl !border !border-slate-200 !shadow-sm lg:!sticky lg:!top-6'>
                                <CardContent className='!p-6'>
                                    <div className='flex items-center justify-between gap-3 mb-1'>
                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                            Your Submission
                                        </Typography>
                                        <Chip
                                            label='Not Submitted'
                                            size='small'
                                            className='!bg-slate-100 !text-slate-600 !font-medium'
                                        />
                                    </div>

                                    <Typography variant='body2' className='!text-slate-500 !mb-5'>
                                        Upload your completed assignment before the deadline
                                    </Typography>

                                    <div className='mb-5'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <Typography variant='caption' className='!text-slate-500'>
                                                Submission progress
                                            </Typography>
                                            <Typography variant='caption' className='!font-semibold !text-slate-600'>
                                                0%
                                            </Typography>
                                        </div>
                                        <LinearProgress
                                            variant='determinate'
                                            value={0}
                                            className='!h-2 !rounded-full !bg-slate-100'
                                        />
                                    </div>

                                    <label className='block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition'>
                                        <input
                                            type='file'
                                            className='hidden'
                                            onChange={handleFileChange}
                                            accept='.pdf, .doc, .docx, .zip, .rar, .png, .jpg, .jpeg'
                                        />

                                        <CloudUpload className='!text-blue-600 !text-4xl !mb-2' />
                                        <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                            Click to upload your file
                                        </Typography>
                                        <Typography variant='caption' className='!text-slate-500'>
                                            PDF, DOCX, ZIP, PNG or JPG
                                        </Typography>
                                    </label>


                                    {selectedFile && (
                                        <div className='mt-4 flex items-center gap-3 border border-emerald-200 bg-emerald-50 rounded-lg p-3'>
                                            <CheckCircle className='!text-emerald-600' fontSize='small' />
                                            <div className='min-w-0'>
                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    {selectedFile.name}
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </div>
                                        </div>
                                    )}

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        label='Submission Comment (Optional)'
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className='!mt-5'
                                    />

                                    <Button
                                        fullWidth
                                        variant='contained'
                                        startIcon={<AssignmentTurnedIn />}
                                        onClick={handleSubmit}
                                        disabled={!selectedFile}
                                        className='!mt-5 !bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !py-3 !shadow-none disabled:!bg-slate-300'
                                    >
                                        Submit Assignment
                                    </Button>

                                    <Typography variant='caption' className='!block !text-center !text-slate-400 !mt-3'>
                                        You can replace your submission before the deadline
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main >
            </div >
        </>
    )
}
