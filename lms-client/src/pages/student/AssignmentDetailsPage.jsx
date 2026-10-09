import { Card, CardContent, Typography, Button, Chip, Divider, TextField, LinearProgress, Snackbar, Alert } from '@mui/material'
import { ArrowBack, CalendarToday, CloudUpload, CheckCircle, AssignmentTurnedIn } from '@mui/icons-material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axiosClient'
import { getStoredProfile } from '../../utils/profileStorage'

export default function AssignmentDetailsPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const profile = getStoredProfile()

    const assignment = location.state?.assignment || {
        _id: 'default',
        title: 'React Component Development',
        course: 'Web Development',
        dueDate: 'Oct 15, 2026',
        points: 100,
        status: 'upcoming',
        description: 'Implement the modular architecture and pass props down to child components.'
    }

    const [selectedFile, setSelectedFile] = useState(null)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) setSelectedFile(file)
    }

    const handleSubmit = async () => {
        if (!selectedFile) return

        try {
            setSubmitting(true)
            await api.post('/assignments/submissions/submit', {
                assignmentId: assignment._id,
                assignmentTitle: assignment.title,
                course: assignment.course,
                studentName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Student User',
                studentEmail: profile.email || 'student@portal.com',
                file: selectedFile.name
            })

            setNotification({
                open: true,
                message: 'Assignment submitted to instructor successfully!',
                severity: 'success'
            })

            setTimeout(() => {
                navigate('/student/assignments')
            }, 1200)
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to submit assignment',
                severity: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const isGraded = assignment.status === 'graded'
    const isSubmitted = assignment.status === 'submitted' || isGraded

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <Button
                        startIcon={<ArrowBack />}
                        className='!normal-case !text-slate-600 !mb-5'
                        onClick={() => navigate('/student/assignments')}
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
                                        </div>
                                        <Chip
                                            label={isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'To Do'}
                                            className={
                                                isGraded
                                                    ? '!bg-green-100 !text-green-800 !font-semibold'
                                                    : isSubmitted
                                                    ? '!bg-blue-100 !text-blue-700 !font-semibold'
                                                    : '!bg-amber-100 !text-amber-700 !font-semibold'
                                            }
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7'>
                                        <div className='flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4'>
                                            <div className='w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center'>
                                                <CalendarToday fontSize='small' />
                                            </div>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-500'>Due Date</Typography>
                                                <Typography variant='body2' className='!font-semibold !text-slate-800'>
                                                    {assignment.dueDate}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4'>
                                            <div className='w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center'>
                                                <AssignmentTurnedIn fontSize='small' />
                                            </div>
                                            <div>
                                                <Typography variant='caption' className='!text-slate-500'>Points Possible</Typography>
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
                                        <Typography variant='body2' className='!text-slate-600 !leading-7'>
                                            {assignment.description || 'Follow all course criteria and submit before the scheduled due date.'}
                                        </Typography>
                                    </section>

                                    {isGraded && (
                                        <section className='mt-7 p-4 bg-emerald-50 border border-emerald-200 rounded-xl'>
                                            <Typography variant='subtitle1' className='!font-bold !text-emerald-900'>
                                                Instructor Assessment: {assignment.score} / {assignment.points}
                                            </Typography>
                                            {assignment.feedback && (
                                                <Typography variant='body2' className='!text-emerald-800 !mt-1 italic'>
                                                    "{assignment.feedback}"
                                                </Typography>
                                            )}
                                        </section>
                                    )}
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
                                            label={isSubmitted ? 'Submitted' : 'Pending'}
                                            size='small'
                                            className={isSubmitted ? '!bg-green-100 !text-green-800' : '!bg-slate-100 !text-slate-600'}
                                        />
                                    </div>
                                    <Typography variant='body2' className='!text-slate-500 !mb-5'>
                                        {isSubmitted
                                            ? 'Deliverable turned in for grading.'
                                            : 'Upload your completed assignment before the deadline.'}
                                    </Typography>

                                    {!isSubmitted && (
                                        <>
                                            <label className='block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition'>
                                                <input
                                                    type='file'
                                                    className='hidden'
                                                    onChange={handleFileChange}
                                                    accept='.pdf, .doc, .docx, .zip, .rar, .png, .jpg, .jpeg'
                                                />
                                                <CloudUpload className='!text-blue-600 !text-4xl !mb-2' />
                                                <Typography variant='body2' className='!font-semibold !text-slate-700'>
                                                    Click to upload file
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-500'>
                                                    PDF, DOCX, or ZIP
                                                </Typography>
                                            </label>

                                            {selectedFile && (
                                                <div className='mt-4 flex items-center gap-3 border border-emerald-200 bg-emerald-50 rounded-lg p-3'>
                                                    <CheckCircle className='!text-emerald-600' fontSize='small' />
                                                    <div className='min-w-0'>
                                                        <Typography variant='body2' className='!font-semibold !text-slate-700 truncate'>
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
                                                minRows={3}
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
                                                disabled={!selectedFile || submitting}
                                                className='!mt-5 !bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !py-3 !shadow-none'
                                            >
                                                {submitting ? 'Submitting...' : 'Submit Assignment'}
                                            </Button>
                                        </>
                                    )}

                                    {isSubmitted && (
                                        <div className='p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-600 text-sm'>
                                            Work submitted. You will receive notifications once graded.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant='filled'>
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    )
}