import { Avatar, Card, CardContent, Typography, Button, Chip, Divider, Dialog, DialogActions, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, DialogContent } from '@mui/material'
import { Add, ForumOutlined, PersonOutlined, Search, Schedule, SchoolOutlined, ChatBubbleOutlined } from '@mui/icons-material'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axiosClient'

export default function DiscussionPage() {
    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('All')
    const [openModal, setOpenModal] = useState(false)
    const [selectedDiscussion, setSelectedDiscussion] = useState(null)
    const [discussionReplies, setDiscussionReplies] = useState([])
    const [replyContent, setReplyContent] = useState('')
    const [replySaving, setReplySaving] = useState(false)
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        courseId: '',
        content: ''
    })
    const [discussions, setDiscussions] = useState([])
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const fetchDiscussionData = useCallback(async () => {
        try {
            setLoading(true)
            const [discussionResponse, courseResponse] = await Promise.all([
                api.get('/discussions'),
                api.get('/courses')
            ])
            setDiscussions(Array.isArray(discussionResponse.data) ? discussionResponse.data : [])
            setCourses(Array.isArray(courseResponse.data) ? courseResponse.data : [])
            setError('')
        } catch (err) {
            console.error('Failed to load discussions:', err)
            setError(err.response?.data?.message || 'Failed to load discussions.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // The fetch updates state when the external request resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDiscussionData()
    }, [fetchDiscussionData])

    const courseOptions = ['All', ...new Set([
        ...courses.map(course => course.courseName),
        ...discussions.map(item => item.course?.courseName)
    ].filter(Boolean))]
    const filteredDiscussions = discussions.filter(item => {
        const courseName = item.course?.courseName || 'General Discussion'
        const authorName = `${item.author?.firstName || ''} ${item.author?.lastName || ''}`.trim()
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.content.toLowerCase().includes(search.toLowerCase()) ||
            authorName.toLowerCase().includes(search.toLowerCase())

        const matchesCourse =
            courseFilter === "All" || courseName === courseFilter

        return matchesSearch && matchesCourse
    })

    const formatCreatedAt = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleString()
    }


    const handleCreateDiscussion = async () => {
        if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
            return
        }

        try {
            setSaving(true)
            const response = await api.post('/discussions', {
                ...newDiscussion,
                courseId: newDiscussion.courseId || null
            })
            setDiscussions(current => [response.data, ...current])
            setOpenModal(false)
            setNewDiscussion({ title: '', courseId: '', content: '' })
            setError('')
        } catch (err) {
            console.error('Failed to create discussion:', err)
            setError(err.response?.data?.message || 'Failed to create discussion.')
        } finally {
            setSaving(false)
        }
    }

    const handleViewDiscussion = async (discussion) => {
        setSelectedDiscussion(discussion)
        setDiscussionReplies([])
        setReplyContent('')
        try {
            const response = await api.get(`/discussions/${discussion._id}/replies`)
            setDiscussionReplies(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            console.error('Failed to load discussion replies:', err)
            setError(err.response?.data?.message || 'Failed to load replies.')
        }
    }

    const handleCreateReply = async () => {
        if (!selectedDiscussion || !replyContent.trim()) return

        try {
            setReplySaving(true)
            const response = await api.post(`/discussions/${selectedDiscussion._id}/replies`, {
                content: replyContent
            })
            setDiscussionReplies(current => [...current, response.data])
            setDiscussions(current => current.map(discussion =>
                discussion._id === selectedDiscussion._id
                    ? { ...discussion, replies: discussion.replies + 1 }
                    : discussion
            ))
            setSelectedDiscussion(current => current
                ? { ...current, replies: current.replies + 1 }
                : current)
            setReplyContent('')
        } catch (err) {
            console.error('Failed to create discussion reply:', err)
            setError(err.response?.data?.message || 'Failed to post reply.')
        } finally {
            setReplySaving(false)
        }
    }

    return (
        <>
            <Navbar />
            <Sidebar />
            <div className='min-h-screen bg-slate-50'>
                <main className='ml-0 lg:ml-[260px] transition-all max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <Typography variant='h4' className='!font-bold !text-slate-800'>
                            Discussions
                        </Typography>

                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                            Ask questions, share ideas, and interact with your classmates and instructors
                        </Typography>

                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={() => setOpenModal(true)}
                            disabled={loading}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-non'
                        >
                            New Discussion
                        </Button>
                    </div >

                    {error && (
                        <Typography color='error' className='!mb-4'>
                            {error}
                        </Typography>
                    )}

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                                        <ForumOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Total Discussions
                                        </Typography>

                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {discussions.length}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center'>
                                        <ChatBubbleOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Total Replies
                                        </Typography>

                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {discussions.reduce((sum, item) => sum + item.replies, 0)}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                            <CardContent className='!p-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center'>
                                        <SchoolOutlined />
                                    </div>
                                    <div>
                                        <Typography variant='body2' className='!text-slate-500'>
                                            Active Courses
                                        </Typography>

                                        <Typography variant='h5' className='!font-bold !text-slate-800'>
                                            {new Set(discussions.map(item => item.course)).size}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mb-6'>
                        <CardContent className='!p-4'>
                            <div className='grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4'>
                                <TextField
                                    fullWidth
                                    size='small'
                                    placeholder='Search discussions...'
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Search className='!text-slate-400 !mr-2' />
                                        )
                                    }}
                                />

                                <FormControl fullWidth size='small'>
                                    <InputLabel>
                                        Course
                                    </InputLabel>
                                    <Select
                                        value={courseFilter}
                                        label='Course'
                                        onChange={e => setCourseFilter(e.target.value)}
                                    >
                                        {courseOptions.map(course => (
                                            <MenuItem key={course} value={course}>
                                                {course}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </CardContent>
                    </Card>


                    <div className='space-y-4'>
                        {loading ? (
                            <Typography className='!text-slate-500'>Loading discussions...</Typography>
                        ) : filteredDiscussions.length > 0 ? (
                            filteredDiscussions.map(discussion => (
                                <Card
                                    key={discussion._id}
                                    className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md !transition-shadow'
                                >
                                    <CardContent className='!p-5 sm:!p-6'>
                                        <div className='flex items-start gap-4'>
                                            <Avatar className='!bg-blue-600'>
                                                {(discussion.author?.firstName?.[0] || '') + (discussion.author?.lastName?.[0] || '')}
                                            </Avatar>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2'>
                                                    <div>
                                                        <Typography variant='h6' className='!font-bold !text-slate-800'>
                                                            {discussion.title}
                                                        </Typography>
                                                        <div className='flex flex-wrap items-center gap-2 mt-2'>
                                                            <Chip
                                                                size='small'
                                                                label={discussion.course?.courseName || 'General Discussion'}
                                                                className='!bg-blue-50 !text-blue-700'
                                                            />

                                                            <Chip
                                                                size='small'
                                                                label={discussion.status}
                                                                className={
                                                                    discussion.status === "Answered"
                                                                        ? '!bg-green-50 !text-green-700'
                                                                        : '!bg-amber-50 !text-amber-700'
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className='flex items-center gap-1 text-slate-400 whitespace-nowrap'>
                                                        <Schedule fontSize='small' />
                                                        <Typography variant='caption' >
                                                            {formatCreatedAt(discussion.createdAt)}
                                                        </Typography>
                                                    </div>
                                                </div>

                                                <Typography variant='body2' className='!text-slate-600 !mt-4 !leading-6'>
                                                    {discussion.content}
                                                </Typography>

                                                <Divider className='!my-4' />

                                                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                                                    <div className='flex flex-wrap items-center gap-4 text-slate-500'>
                                                        <div className='flex items-center gap-1.5'>
                                                            <PersonOutlined fontSize='small' />
                                                            <Typography variant='body2'>
                                                                {`${discussion.author?.firstName || ''} ${discussion.author?.lastName || ''}`.trim()}
                                                            </Typography>
                                                        </div>

                                                        <div className='flex items-center gap-1.5'>
                                                            <ChatBubbleOutlined fontSize='small' />
                                                            <Typography variant='body2'>
                                                                {discussion.replies} replies
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant='outlined'
                                                        onClick={() => handleViewDiscussion(discussion)}
                                                        className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                    >
                                                        View Discussion
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!py-14 !text-center'>
                                    <ForumOutlined className='!text-slate-300 !text-5xl' />
                                    <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                        No discussions found
                                    </Typography>

                                    <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                        Try changing your search or course filter
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main >
            </div >


            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    Create New Discussion
                </DialogTitle>

                <DialogContent>
                    <div className='space-y-4 mt-2'>
                        <TextField
                            fullWidth
                            label='Discussion Title'
                            value={newDiscussion.title}
                            onChange={e => setNewDiscussion({
                                ...newDiscussion,
                                title: e.target.value
                            })}
                        />

                        <div className='w-full'>
                            <label htmlFor='discussion-course' className='block text-sm text-slate-600 mb-1'>
                                Course (optional)
                            </label>
                            <select
                                id='discussion-course'
                                name='courseId'
                                value={newDiscussion.courseId}
                                onChange={e => {
                                    const courseId = e.currentTarget.value
                                    setNewDiscussion(current => ({
                                        ...current,
                                        courseId
                                    }))
                                }}
                                className='w-full h-14 rounded border border-slate-300 bg-white px-3 text-slate-700 cursor-pointer focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'
                            >
                                <option value=''>General Discussion</option>
                                {courses.length > 0 ? courses.map(course => (
                                    <option key={String(course._id)} value={String(course._id)}>
                                        {course.courseCode} - {course.courseName}
                                    </option>
                                )) : (
                                    <option value='' disabled>No courses available</option>
                                )}
                            </select>
                        </div>

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            label='Discussion Content'
                            placeholder='Write your question or discussion topic...'
                            value={newDiscussion.content}
                            onChange={e => setNewDiscussion({
                                ...newDiscussion,
                                content: e.target.value
                            })}
                        />
                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenModal(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>

                    <Button
                        variant='contained'
                        onClick={handleCreateDiscussion}
                        disabled={
                            !newDiscussion.title ||
                            !newDiscussion.content ||
                            saving
                        }
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {saving ? 'Saving...' : 'Post Discussion'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(selectedDiscussion)}
                onClose={() => setSelectedDiscussion(null)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='!font-bold !text-slate-800'>
                    {selectedDiscussion?.title}
                </DialogTitle>

                <DialogContent>
                    {selectedDiscussion && (
                        <div className='space-y-4'>
                            <div className='flex flex-wrap gap-2'>
                                <Chip
                                    size='small'
                                    label={selectedDiscussion.course?.courseName || 'General Discussion'}
                                    className='!bg-blue-50 !text-blue-700'
                                />
                                <Chip
                                    size='small'
                                    label={selectedDiscussion.status}
                                    className={selectedDiscussion.status === 'Answered'
                                        ? '!bg-green-50 !text-green-700'
                                        : '!bg-amber-50 !text-amber-700'}
                                />
                            </div>

                            <Typography className='!whitespace-pre-wrap !leading-7 !text-slate-700'>
                                {selectedDiscussion.content}
                            </Typography>

                            <Divider />

                            <Typography variant='body2' className='!text-slate-500'>
                                Posted by {`${selectedDiscussion.author?.firstName || ''} ${selectedDiscussion.author?.lastName || ''}`.trim()}
                                {' '}on {formatCreatedAt(selectedDiscussion.createdAt)}
                            </Typography>

                            <Typography variant='body2' className='!text-slate-500'>
                                {selectedDiscussion.replies} replies
                            </Typography>

                            <Divider />

                            <div className='space-y-3'>
                                <Typography className='!font-semibold !text-slate-800'>
                                    Replies
                                </Typography>
                                {discussionReplies.length > 0 ? discussionReplies.map(reply => (
                                    <div key={reply._id} className='rounded-lg bg-slate-50 p-3'>
                                        <Typography variant='body2' className='!whitespace-pre-wrap !text-slate-700'>
                                            {reply.content}
                                        </Typography>
                                        <Typography variant='caption' className='!text-slate-500'>
                                            {`${reply.author?.firstName || ''} ${reply.author?.lastName || ''}`.trim()}
                                            {' '}on {formatCreatedAt(reply.createdAt)}
                                        </Typography>
                                    </div>
                                )) : (
                                    <Typography variant='body2' className='!text-slate-500'>
                                        No replies yet.
                                    </Typography>
                                )}
                            </div>

                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label='Write a reply'
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                            />
                        </div>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={handleCreateReply}
                        disabled={!replyContent.trim() || replySaving}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        {replySaving ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button
                        onClick={() => setSelectedDiscussion(null)}
                        className='!normal-case !text-slate-600'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
