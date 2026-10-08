import { Avatar, Card, CardContent, Typography, Button, Chip, Divider, Dialog, DialogActions, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, DialogContent } from '@mui/material'
import { Add, ForumOutlined, PersonOutlined, Search, Schedule, SchoolOutlined, ChatBubbleOutlined } from '@mui/icons-material'
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function DiscussionPage() {
    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('All')
    const [openModal, setOpenModal] = useState(false)
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        course: '',
        content: ''
    })

    const discussions = [{
        id: 1,
        title: 'What is the difference between HTTP and HTTPS',
        course: 'Web Development',
        author: 'John Cruz',
        initials: 'JC',
        content: 'DIQWDHIOQWD',
        replies: 10,
        createdAt: '2 hours ago',
        status: 'Open'
    },
    {
        id: 2,
        title: 'What is the difference between HTTP and HTTPS',
        course: 'Web Development',
        author: 'John Cruz',
        initials: 'JC',
        content: 'DIQWDHIOQWD',
        replies: 10,
        createdAt: '2 hours ago',
        status: 'Open'
    },
    {
        id: 3,
        title: 'What is the difference between HTTP and HTTPS',
        course: 'Web Development',
        author: 'John Cruz',
        initials: 'JC',
        content: 'DIQWDHIOQWD',
        replies: 10,
        createdAt: '2 hours ago',
        status: 'Open'
    },
    ]

    const courses = ['All', ...new Set(discussions.map(item => item.course))]
    const filteredDiscussions = discussions.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.content.toLowerCase().includes(search.toLowerCase()) ||
            item.author.toLowerCase().includes(search.toLowerCase())

        const matchesCourse =
            courseFilter === "All" || item.course === courseFilter

        return matchesSearch && matchesCourse
    })


    const handleCreateDiscussion = () => {
        if (!newDiscussion.title || !newDiscussion.course || !newDiscussion.content) {
            return
        }

        setOpenModal(false)
        setNewDiscussion({
            title: '',
            course: '',
            content: ''
        })
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
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-non'
                        >
                            New Discussion
                        </Button>
                    </div >

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
                                        {courses.map(course => (
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
                        {filteredDiscussions.length > 0 ? (
                            filteredDiscussions.map(discussion => (
                                <Card
                                    key={discussion.id}
                                    className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md !transition-shadow'
                                >
                                    <CardContent className='!p-5 sm:!p-6'>
                                        <div className='flex items-start gap-4'>
                                            <Avatar className='!bg-blue-600'>
                                                {discussion.initials}
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
                                                                label={discussion.course}
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
                                                            {discussion.createdAt}
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
                                                                {discussion.author}
                                                            </Typography>
                                                        </div>

                                                        <div className='flex items-center gap-1.5'>
                                                            <PersonOutlined fontSize='small' />
                                                            <Typography variant='body2'>
                                                                {discussion.replies} replies
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant='outlined'
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

                        <FormControl fullWidth>
                            <InputLabel>
                                Course
                            </InputLabel>
                            <Select
                                value={newDiscussion.course}
                                label='Course'
                                onChange={e => setNewDiscussion({
                                    ...newDiscussion,
                                    course: e.target.value
                                })}
                            >
                                {courses.filter(course => course !== 'All').map(course => (
                                    <MenuItem key={course} value={course}>
                                        {course}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                            !newDiscussion.course ||
                            !newDiscussion.content
                        }
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Post Discussion
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
