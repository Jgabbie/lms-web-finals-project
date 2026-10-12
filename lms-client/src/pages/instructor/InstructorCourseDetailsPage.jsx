import {
    Avatar,
    Typography,
    Button,
    Chip,
    Divider,
    Tab,
    Tabs,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material'
import {
    CalendarTodayRounded as CalendarToday,
    MeetingRoomRounded as MeetingRoom,
    PersonRounded as Person,
    MenuBookRounded as MenuBook,
    AssignmentRounded as Assignment,
    SchoolRounded as School,
    CheckCircleRounded as CheckCircle,
    ChatBubbleRounded as ChatBubble,
    InsertDriveFileRounded as InsertDriveFile,
    PictureAsPdfRounded as PictureAsPdf,
    SlideshowRounded as Slideshow,
    VideoLibraryRounded as VideoLibrary,
    DescriptionRounded as Description,
    AddRounded as Add,
    DeleteRounded as Delete,
    EditRounded as Edit,
    VisibilityRounded as Visibility,
    DownloadRounded as Download
} from '@mui/icons-material'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavbarInstructor from '../../components/NavbarInstructor'
import SidebarInstructor from '../../components/SidebarInstructor'
import api from '../../api/axiosClient'
import { getStoredProfile } from '../../utils/profileStorage'

export default function InstructorCourseDetailsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const profile = getStoredProfile()
    const instructorFullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Instructor'

    const location = useLocation()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(true)
    const [course, setCourse] = useState(null)
    const [materials, setMaterials] = useState([])
    const [courseAssignments, setCourseAssignments] = useState([])
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    // Material Modals
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [uploadingMaterial, setUploadingMaterial] = useState(false)
    const [selectedUploadFile, setSelectedUploadFile] = useState(null)
    const fileInputRef = useRef(null)
    const [materialForm, setMaterialForm] = useState({
        title: '',
        type: 'PDF',
        description: ''
    })

    const [openEditMaterialModal, setOpenEditMaterialModal] = useState(false)
    const [editingMaterialId, setEditingMaterialId] = useState(null)
    const [editMaterialForm, setEditMaterialForm] = useState({
        title: '',
        type: 'PDF',
        description: ''
    })

    const [deleteMaterialModal, setDeleteMaterialModal] = useState(false)
    const [materialToDelete, setMaterialToDelete] = useState(null)
    const [deletingMaterial, setDeletingMaterial] = useState(false)

    // Announcement Modal
    const [openAnnounceModal, setOpenAnnounceModal] = useState(false)
    const [announceForm, setAnnounceForm] = useState({ title: '', content: '' })

    // Overview Edit Modal
    const [openOverviewModal, setOpenOverviewModal] = useState(false)
    const [overviewForm, setOverviewForm] = useState({ description: '', objectivesText: '', schedule: '', room: '' })

    const targetCourseId = location.state?.courseId || location.state?.course?._id  

    const fetchCourseData = useCallback(async () => {
        try {
            setLoading(true)
            let currentCourse = null

            if (targetCourseId) {
                const res = await api.get(`/courses/${targetCourseId}`)  
                currentCourse = res.data  
            } else {
                const res = await api.get('/courses')  
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const detailRes = await api.get(`/courses/${res.data[0]._id}`)  
                    currentCourse = detailRes.data  
                }
            }

            if (currentCourse) {
                setCourse(currentCourse)

                const [allMaterialsRes, allAssignmentsRes] = await Promise.all([
                    api.get('/materials'),
                    api.get('/assignments')
                ])  

                if (Array.isArray(allMaterialsRes.data)) {
                    setMaterials(allMaterialsRes.data.filter(m => 
                        m.course === currentCourse.courseName || 
                        m.course === currentCourse.courseCode ||
                        String(m.courseId) === String(currentCourse._id)
                    ))  
                }

                if (Array.isArray(allAssignmentsRes.data)) {
                    setCourseAssignments(allAssignmentsRes.data.filter(a => 
                        a.course === currentCourse.courseName || 
                        String(a.courseId) === String(currentCourse._id)
                    ))  
                }
            }
        } catch (err) {
            console.error('Error fetching course dashboard details:', err)  
        } finally {
            setLoading(false)
        }
    }, [targetCourseId])

    useEffect(() => {
        fetchCourseData()
    }, [fetchCourseData])

    const displayedInstructorName = useMemo(() => {
        if (!course?.instructor || course.instructor === 'Instructor Portal') {
            return instructorFullName
        }
        return course.instructor
    }, [course?.instructor, instructorFullName])

    const instructorInitials = useMemo(() => {
        const parts = displayedInstructorName.trim().split(/\s+/)
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        }
        return displayedInstructorName.slice(0, 2).toUpperCase() || 'IN'
    }, [displayedInstructorName])

    const getIcon = type => {
        switch (type) {
            case 'PDF': return <PictureAsPdf />  
            case 'Presentation': return <Slideshow />  
            case 'Video': return <VideoLibrary />  
            case 'Document': return <Description />  
            default: return <InsertDriveFile />  
        }
    }

    const handleViewFile = (fileUrl) => {
        if (!fileUrl) {
            setNotification({ open: true, message: 'No file attached to view', severity: 'warning' })  
            return
        }
        window.open(fileUrl, '_blank', 'noopener,noreferrer')  
    }

    const handleDownloadFile = async (item) => {
        if (!item.fileUrl) {
            setNotification({ open: true, message: 'No file available to download', severity: 'warning' })  
            return
        }
        try {
            const res = await fetch(item.fileUrl)  
            const blob = await res.blob()  
            const blobUrl = window.URL.createObjectURL(blob)  
            const a = document.createElement('a')  
            a.href = blobUrl  
            a.download = item.fileName || `${item.title}.pdf`  
            document.body.appendChild(a)  
            a.click()  
            document.body.removeChild(a)  
            window.URL.revokeObjectURL(blobUrl)  
        } catch {
            window.open(item.fileUrl, '_blank')  
        }
    }

    // Material CRUD
    const handleUploadMaterialSubmit = async () => {
        if (!materialForm.title.trim()) {
            setNotification({ open: true, message: 'Material title is required', severity: 'error' })  
            return
        }
        try {
            setUploadingMaterial(true)
            const formData = new FormData()  
            formData.append('title', materialForm.title.trim())  
            formData.append('course', course.courseName)  
            formData.append('courseId', course._id)  
            formData.append('type', materialForm.type)  
            formData.append('description', materialForm.description.trim())  
            formData.append('instructor', displayedInstructorName)  

            if (selectedUploadFile) {
                formData.append('file', selectedUploadFile)  
            }

            const res = await api.post('/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })  

            setMaterials(prev => [res.data.material, ...prev])  
            setOpenUploadModal(false)  
            setSelectedUploadFile(null)  
            if (fileInputRef.current) fileInputRef.current.value = ''  
            setMaterialForm({ title: '', type: 'PDF', description: '' })  
            setNotification({ open: true, message: 'Material uploaded!', severity: 'success' })  
        } catch (err) {
            setNotification({ open: true, message: err.response?.data?.message || 'Upload failed', severity: 'error' })  
        } finally {
            setUploadingMaterial(false)
        }
    }

    const handleOpenEditMaterial = (m) => {
        setEditingMaterialId(m._id)  
        setEditMaterialForm({
            title: m.title || '',
            type: m.type || 'PDF',
            description: m.description || ''
        })  
        setOpenEditMaterialModal(true)  
    }

    const handleUpdateMaterialSubmit = async (e) => {
        e.preventDefault()  
        if (!editMaterialForm.title.trim()) return  
        try {
            const res = await api.put(`/materials/${editingMaterialId}`, {
                ...editMaterialForm,
                course: course.courseName
            })  
            setMaterials(prev => prev.map(m => m._id === editingMaterialId ? res.data.material : m))  
            setOpenEditMaterialModal(false)  
            setEditingMaterialId(null)  
            setNotification({ open: true, message: 'Material updated successfully!', severity: 'success' })  
        } catch {
            setNotification({ open: true, message: 'Failed to update material', severity: 'error' })  
        }
    }

    const handleConfirmDeleteMaterial = async () => {
        if (!materialToDelete) return  
        try {
            setDeletingMaterial(true)
            await api.delete(`/materials/${materialToDelete._id}`)  
            setMaterials(prev => prev.filter(m => m._id !== materialToDelete._id))  
            setDeleteMaterialModal(false)  
            setMaterialToDelete(null)  
            setNotification({ open: true, message: 'Material deleted', severity: 'success' })  
        } catch {
            setNotification({ open: true, message: 'Failed to delete material', severity: 'error' })  
        } finally {
            setDeletingMaterial(false)
        }
    }

    // Announcement CRUD
    const handleAddAnnouncement = async () => {
        if (!announceForm.title.trim() || !announceForm.content.trim()) return  
        try {
            const res = await api.post(`/courses/${course._id}/announcements`, announceForm)  
            setCourse(prev => ({ ...prev, announcements: res.data.announcements }))  
            setOpenAnnounceModal(false)  
            setAnnounceForm({ title: '', content: '' })  
            setNotification({ open: true, message: 'Announcement posted!', severity: 'success' })  
        } catch {
            setNotification({ open: true, message: 'Failed to post announcement', severity: 'error' })  
        }
    }

    const handleDeleteAnnouncement = async (announcementId) => {
        try {
            const res = await api.delete(`/courses/${course._id}/announcements/${announcementId}`)  
            setCourse(prev => ({ ...prev, announcements: res.data.announcements }))  
            setNotification({ open: true, message: 'Announcement deleted', severity: 'success' })  
        } catch {
            setNotification({ open: true, message: 'Failed to delete announcement', severity: 'error' })  
        }
    }

    // Overview CRUD
    const handleOpenEditOverview = () => {
        setOverviewForm({
            description: course?.description || '',
            objectivesText: (course?.learningObjectives || []).join('\n'),
            schedule: course?.schedule || '',
            room: course?.room || ''
        })  
        setOpenOverviewModal(true)  
    }

    const handleSaveOverview = async () => {
        try {
            const objectives = overviewForm.objectivesText.split('\n').map(o => o.trim()).filter(Boolean)  
            const res = await api.put(`/courses/${course._id}/overview`, {
                description: overviewForm.description,
                learningObjectives: objectives,
                schedule: overviewForm.schedule,
                room: overviewForm.room
            })  
            setCourse(prev => ({ ...prev, ...res.data.course }))  
            setOpenOverviewModal(false)  
            setNotification({ open: true, message: 'Course overview updated!', severity: 'success' })  
        } catch {
            setNotification({ open: true, message: 'Failed to update overview', severity: 'error' })  
        }
    }

    const announcements = course?.announcements || []  

    return (
        <div className='min-h-screen bg-[#f5f8fa]'>
            <NavbarInstructor sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />  
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />  

            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}  
            >
                <main className='max-w-[1300px] mx-auto px-4 sm:px-8 py-7'>
                    {loading || !course ? (
                        <div className='py-20 text-center text-slate-500'>
                            <Typography>Loading course dashboard...</Typography>  
                        </div>
                    ) : (
                        <>
                            {/* Deep Teal Hero Card */}
                            <div className='bg-[#002f37] rounded-3xl p-7 sm:p-8 text-white relative shadow-sm mb-6'>
                                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                                    <div>
                                        <div className='flex items-center gap-2 mb-3.5'>
                                            <span className='bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-md font-semibold'>
                                                {course.courseCode}  
                                            </span>
                                            <span className='bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-md font-semibold'>
                                                {course.units || 3} Units  
                                            </span>
                                            <span className='bg-amber-400 text-slate-900 text-xs px-2.5 py-1 rounded-md font-bold'>
                                                Instructor Workspace
                                            </span>
                                        </div>

                                        <Typography variant='h3' className='!font-extrabold !text-white !tracking-tight !text-3xl sm:!text-4xl'>
                                            {course.courseName}  
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-300 !mt-2.5 !max-w-2xl !leading-relaxed'>
                                            {course.description || 'Manage curriculum content, reference materials, and assignments for your students.'}  
                                        </Typography>

                                        <div className='flex flex-wrap items-center gap-2.5 mt-6'>
                                            <div className='flex items-center gap-2 bg-[#00414c]/70 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200'>
                                                <Person className='!text-base text-slate-300' />  
                                                <span>Prof. {displayedInstructorName}</span>  
                                            </div>
                                            <div className='flex items-center gap-2 bg-[#00414c]/70 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200'>
                                                <CalendarToday className='!text-sm text-slate-300' />  
                                                <span>{course.schedule || 'Schedule TBA'}</span>  
                                            </div>
                                            <div className='flex items-center gap-2 bg-[#00414c]/70 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200'>
                                                <MeetingRoom className='!text-base text-slate-300' />
                                                <span>{course.room || 'Room TBA'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='bg-[#003d48]/80 border border-white/5 rounded-2xl p-5 min-w-[270px]'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-xs font-semibold text-slate-300'>Course Materials</span>
                                            <span className='text-sm font-black text-white'>{materials.length} Total</span>
                                        </div>
                                        <div className='h-2 bg-[#00262c] rounded-full overflow-hidden mt-2.5'>
                                            <div className='h-full bg-amber-400 rounded-full w-full' />  
                                        </div>
                                        <span className='text-xs text-slate-300 mt-2.5 block'>
                                            {courseAssignments.length} scheduled student assignments  
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6'>
                                <div className='bg-[#e6f4f6] rounded-2xl p-5 flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                        <MenuBook />  
                                    </div>
                                    <div>
                                        <span className='text-xs font-medium text-slate-600 block'>Modules</span>  
                                        <span className='text-2xl font-black text-slate-900'>{materials.length}</span>  
                                    </div>
                                </div>

                                <div className='bg-[#e7f7ed] rounded-2xl p-5 flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                        <InsertDriveFile />  
                                    </div>
                                    <div>
                                        <span className='text-xs font-medium text-slate-600 block'>Lessons</span>  
                                        <span className='text-2xl font-black text-slate-900'>{materials.length}</span>  
                                    </div>
                                </div>

                                <div className='bg-[#eaf5f8] rounded-2xl p-5 flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                        <Assignment />  
                                    </div>
                                    <div>
                                        <span className='text-xs font-medium text-slate-600 block'>Assignments</span>  
                                        <span className='text-2xl font-black text-slate-900'>{courseAssignments.length}</span>  
                                    </div>
                                </div>

                                <div className='bg-[#fff4db] rounded-2xl p-5 flex items-center gap-4'>
                                    <div className='w-12 h-12 rounded-xl bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                        <School />  
                                    </div>
                                    <div>
                                        <span className='text-xs font-medium text-slate-600 block'>Semester</span>  
                                        <span className='text-xl font-black text-slate-900'>{course.semester || '1st Sem'}</span>  
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Strip with Action Controls */}
                            <div className='bg-white rounded-2xl border border-slate-200/80 px-6 py-2.5 mb-6 flex items-center justify-between shadow-xs'>
                                <Tabs
                                    value={activeTab}
                                    onChange={(_, v) => setActiveTab(v)}  
                                    TabIndicatorProps={{ style: { backgroundColor: '#002f37', height: 3, borderRadius: 2 } }}  
                                    sx={{
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.925rem',
                                            color: '#64748b',
                                            minWidth: 100,
                                            '&.Mui-selected': { color: '#002f37' }
                                        }
                                    }}  
                                >
                                    <Tab label='Overview' />  
                                    <Tab label='Modules' />  
                                    <Tab label='Assignments' />  
                                    <Tab label='Announcements' />  
                                </Tabs>

                                <div className='hidden sm:block'>
                                    {activeTab === 1 && (
                                        <Button
                                            size='small'
                                            variant='contained'
                                            startIcon={<Add />}
                                            onClick={() => setOpenUploadModal(true)}
                                            className='!bg-amber-400 hover:!bg-amber-500 !text-slate-900 !font-bold !normal-case !rounded-xl !px-4 !shadow-none'  
                                        >
                                            Upload Material  
                                        </Button>
                                    )}
                                    {activeTab === 2 && (
                                        <Button
                                            size='small'
                                            variant='contained'
                                            startIcon={<Add />}
                                            onClick={() => navigate('/instructor/assignments')}
                                            className='!bg-amber-400 hover:!bg-amber-500 !text-slate-900 !font-bold !normal-case !rounded-xl !px-4 !shadow-none'  
                                        >
                                            Add Assignment  
                                        </Button>
                                    )}
                                    {activeTab === 3 && (
                                        <Button
                                            size='small'
                                            variant='contained'
                                            startIcon={<Add />}
                                            onClick={() => setOpenAnnounceModal(true)}
                                            className='!bg-amber-400 hover:!bg-amber-500 !text-slate-900 !font-bold !normal-case !rounded-xl !px-4 !shadow-none'  
                                        >
                                            Post Announcement  
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Tab 0: Overview */}
                            {activeTab === 0 && (
                                <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
                                    <div>
                                        <div className='flex items-center justify-between mb-2'>
                                            <Typography variant='h6' className='!font-extrabold !text-slate-800'>
                                                About this course  
                                            </Typography>
                                            <Button
                                                size='small'
                                                startIcon={<Edit fontSize='small' />}
                                                onClick={handleOpenEditOverview}
                                                className='!normal-case !text-[#002f37] !font-bold'  
                                            >
                                                Edit Overview
                                            </Button>
                                        </div>
                                        <Typography className='!text-slate-600 !text-sm !leading-relaxed'>
                                            {course.description || 'This course covers the core fundamentals of web development and software design.'}  
                                        </Typography>

                                        <Typography variant='h6' className='!font-extrabold !text-slate-800 !mt-7 !mb-4'>
                                            Learning Objectives  
                                        </Typography>
                                        <div className='space-y-3.5'>
                                            {(course.learningObjectives && course.learningObjectives.length > 0) ? (
                                                course.learningObjectives.map((obj, i) => (
                                                    <div key={i} className='flex items-center gap-3'>
                                                        <div className='w-7 h-7 rounded-lg bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                                            <CheckCircle className='!text-base' />  
                                                        </div>
                                                        <Typography variant='body2' className='!text-slate-700 !font-medium'>
                                                            {obj}  
                                                        </Typography>
                                                    </div>
                                                ))
                                            ) : (
                                                <Typography variant='body2' className='!text-slate-400 !italic'>
                                                    No learning objectives have been set for this course yet.
                                                </Typography>
                                            )}
                                        </div>
                                    </div>

                                    {/* Instructor Card */}
                                    <div className='bg-white rounded-2xl border border-slate-200/80 p-6 h-fit shadow-xs'>
                                        <Typography variant='subtitle1' className='!font-extrabold !text-slate-900'>
                                            Instructor  
                                        </Typography>
                                        <div className='flex items-center gap-3.5 mt-4'>
                                            <Avatar className='!bg-[#0284c7] !font-bold !text-sm !w-12 !h-12'>
                                                {instructorInitials}  
                                            </Avatar>
                                            <div>
                                                <Typography className='!font-bold !text-slate-800 !text-sm'>
                                                    Prof. {displayedInstructorName}  
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    Course Instructor  
                                                </Typography>
                                            </div>
                                        </div>
                                        <Divider className='!my-5' />  
                                        <div className='space-y-3 text-xs'>
                                            <div>
                                                <span className='text-slate-400 block'>Schedule</span>  
                                                <span className='font-semibold text-slate-800 text-sm mt-0.5 block'>{course.schedule || 'Schedule TBA'}</span>  
                                            </div>
                                            <div>
                                                <span className='text-slate-400 block'>Room</span>
                                                <span className='font-semibold text-slate-800 text-sm mt-0.5 block'>{course.room || 'Room TBA'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 1: Modules (Connected to Learning Materials) */}
                            {activeTab === 1 && (
                                <div className='space-y-3.5'>
                                    {materials.length > 0 ? (
                                        materials.map((m) => (
                                            <div
                                                key={m._id}
                                                className='bg-white rounded-2xl border border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-[#002f37]/40 transition'  
                                            >
                                                <div className='flex items-center gap-4'>
                                                    <div className='w-10 h-10 rounded-xl bg-[#003d48] text-white flex items-center justify-center shrink-0'>
                                                        {getIcon(m.type)}  
                                                    </div>
                                                    <div>
                                                        <Typography
                                                            onClick={() => handleViewFile(m.fileUrl)}
                                                            className={`!font-extrabold !text-slate-800 !text-base ${m.fileUrl ? 'cursor-pointer hover:!text-blue-600' : ''}`}  
                                                        >
                                                            {m.title}  
                                                        </Typography>
                                                        <div className='flex items-center gap-2 text-xs text-slate-400 mt-0.5'>
                                                            <span>{m.type}</span>  
                                                            <span>•</span>
                                                            <span>{m.fileSize || '1.0 MB'}</span>  
                                                            <span>•</span>
                                                            <span>Uploaded by {m.instructor}</span>  
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-2 shrink-0'>
                                                    <Button
                                                        size='small'
                                                        variant='outlined'
                                                        startIcon={<Visibility fontSize='small' />}
                                                        onClick={() => handleViewFile(m.fileUrl)}
                                                        disabled={!m.fileUrl}
                                                        className='!normal-case !text-xs !rounded-xl !border-slate-300 !text-slate-700'  
                                                    >
                                                        View  
                                                    </Button>
                                                    <Button
                                                        size='small'
                                                        variant='outlined'
                                                        startIcon={<Download fontSize='small' />}
                                                        onClick={() => handleDownloadFile(m)}
                                                        disabled={!m.fileUrl}
                                                        className='!normal-case !text-xs !rounded-xl !border-slate-300 !text-slate-700'  
                                                    >
                                                        Download  
                                                    </Button>

                                                    <Tooltip title='Edit'>
                                                        <IconButton size='small' onClick={() => handleOpenEditMaterial(m)}>  
                                                            <Edit fontSize='small' className='text-slate-500' />  
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title='Delete'>
                                                        <IconButton
                                                            size='small'
                                                            color='error'
                                                            onClick={() => {
                                                                setMaterialToDelete(m)
                                                                setDeleteMaterialModal(true)
                                                            }}  
                                                        >
                                                            <Delete fontSize='small' />  
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300'>
                                            <MenuBook className='text-slate-300 text-5xl mb-2' />  
                                            <Typography className='!font-bold !text-slate-700'>
                                                No Materials Published  
                                            </Typography>
                                            <Typography variant='caption' className='!text-slate-400'>
                                                Click "Upload Material" to attach syllabus or lecture documents.
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Assignments */}
                            {activeTab === 2 && (
                                <div className='space-y-3.5'>
                                    {courseAssignments.length > 0 ? (
                                        courseAssignments.map(asg => (
                                            <div
                                                key={asg._id}
                                                className='bg-white rounded-2xl border border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs'  
                                            >
                                                <div>
                                                    <div className='flex items-center gap-2.5'>
                                                        <Typography className='!font-extrabold !text-slate-800 !text-base'>
                                                            {asg.title}  
                                                        </Typography>
                                                        <span className='bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200'>
                                                            Published  
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-2 text-xs text-slate-400 mt-1'>
                                                        <span>Due: {asg.dueDate}</span>  
                                                        <span>•</span>
                                                        <span>{asg.points} points</span>  
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => navigate('/instructor/assignments')}  
                                                    className='rounded-full px-5 py-2 text-xs font-bold border border-slate-300 text-slate-700 hover:border-[#002f37] hover:text-[#002f37] transition whitespace-nowrap'  
                                                >
                                                    View in Assignments  
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300'>
                                            <Assignment className='text-slate-300 text-5xl mb-2' />  
                                            <Typography className='!font-bold !text-slate-700'>
                                                No Assignments  
                                            </Typography>
                                            <Typography variant='caption' className='!text-slate-400'>
                                                No tasks scheduled for this course.  
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 3: Announcements */}
                            {activeTab === 3 && (
                                <div className='space-y-3.5'>
                                    {announcements.length > 0 ? (
                                        announcements.map(ann => (
                                            <div
                                                key={ann._id}
                                                className='bg-white rounded-2xl border border-slate-200/80 p-5 flex items-start gap-4 shadow-xs'  
                                            >
                                                <div className='w-11 h-11 rounded-xl bg-[#00acc1] text-white flex items-center justify-center shrink-0'>
                                                    <ChatBubble className='!text-xl' />  
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <div className='flex items-start justify-between gap-2'>
                                                        <div>
                                                            <Typography className='!font-extrabold !text-slate-800 !text-sm uppercase tracking-wide'>
                                                                {ann.title}  
                                                            </Typography>
                                                            <Typography variant='caption' className='!text-slate-400 block'>
                                                                {ann.date}  
                                                            </Typography>
                                                        </div>
                                                        <IconButton
                                                            size='small'
                                                            color='error'
                                                            onClick={() => handleDeleteAnnouncement(ann._id)}  
                                                        >
                                                            <Delete fontSize='small' />  
                                                        </IconButton>
                                                    </div>
                                                    <Typography variant='body2' className='!text-slate-600 !mt-2 !text-xs !leading-relaxed'>
                                                        {ann.content}  
                                                    </Typography>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300'>
                                            <ChatBubble className='text-slate-300 text-5xl mb-2' />  
                                            <Typography className='!font-bold !text-slate-700'>
                                                No Announcements  
                                            </Typography>
                                            <Typography variant='caption' className='!text-slate-400'>
                                                Course bulletins and updates will appear here.  
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Upload Material Modal */}
            <Dialog open={openUploadModal} onClose={() => !uploadingMaterial && setOpenUploadModal(false)} fullWidth maxWidth='sm'>  
                <DialogTitle className='!font-bold !text-slate-800'>Upload Material</DialogTitle>  
                <DialogContent>
                    <div className='flex flex-col gap-4 mt-2'>
                        <TextField
                            fullWidth
                            required
                            label='Material Title'
                            placeholder='e.g. Introduction to Database Normalization'
                            value={materialForm.title}
                            onChange={e => setMaterialForm(p => ({ ...p, title: e.target.value }))}  
                        />
                        <TextField
                            select
                            fullWidth
                            label='File Type'
                            value={materialForm.type}
                            onChange={e => setMaterialForm(p => ({ ...p, type: e.target.value }))}  
                        >
                            <MenuItem value='PDF'>PDF Document</MenuItem>  
                            <MenuItem value='Presentation'>Slide Presentation</MenuItem>  
                            <MenuItem value='Video'>Video</MenuItem>  
                            <MenuItem value='Document'>Document</MenuItem>  
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label='Description (Optional)'
                            value={materialForm.description}
                            onChange={e => setMaterialForm(p => ({ ...p, description: e.target.value }))}  
                        />
                        <Button
                            component='label'
                            variant='outlined'
                            fullWidth
                            startIcon={<InsertDriveFile />}
                            className='!normal-case !rounded-xl !border-slate-300 !text-slate-700 !py-3'  
                        >
                            {selectedUploadFile ? selectedUploadFile.name : 'Choose File'}  
                            <input
                                ref={fileInputRef}
                                hidden
                                type='file'
                                accept='.pdf, .doc, .docx, .ppt, .pptx, .zip, .rar, .png, .jpg, .jpeg, .mp4'
                                onChange={e => setSelectedUploadFile(e.target.files?.[0] || null)}  
                            />
                        </Button>
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-4'>
                    <Button onClick={() => setOpenUploadModal(false)} disabled={uploadingMaterial} className='!normal-case !text-slate-600'>Cancel</Button>  
                    <Button
                        variant='contained'
                        onClick={handleUploadMaterialSubmit}
                        disabled={uploadingMaterial}
                        className='!bg-[#002f37] hover:!bg-[#00414c] !normal-case !rounded-xl !shadow-none'  
                    >
                        {uploadingMaterial ? 'Uploading...' : 'Upload'}  
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Material Modal */}
            <Dialog open={openEditMaterialModal} onClose={() => setOpenEditMaterialModal(false)} fullWidth maxWidth='sm'>  
                <DialogTitle className='!font-bold !text-slate-800'>Edit Material</DialogTitle>  
                <form onSubmit={handleUpdateMaterialSubmit}>  
                    <DialogContent>
                        <div className='flex flex-col gap-4 mt-2'>
                            <TextField
                                fullWidth
                                required
                                label='Material Title'
                                value={editMaterialForm.title}
                                onChange={e => setEditMaterialForm(p => ({ ...p, title: e.target.value }))}  
                            />
                            <TextField
                                select
                                fullWidth
                                label='Type'
                                value={editMaterialForm.type}
                                onChange={e => setEditMaterialForm(p => ({ ...p, type: e.target.value }))}  
                            >
                                <MenuItem value='PDF'>PDF Document</MenuItem>  
                                <MenuItem value='Presentation'>Slide Presentation</MenuItem>  
                                <MenuItem value='Video'>Video</MenuItem>  
                                <MenuItem value='Document'>Document</MenuItem>  
                            </TextField>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label='Description'
                                value={editMaterialForm.description}
                                onChange={e => setEditMaterialForm(p => ({ ...p, description: e.target.value }))}  
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className='!px-6 !pb-4'>
                        <Button onClick={() => setOpenEditMaterialModal(false)} className='!normal-case !text-slate-600'>Cancel</Button>  
                        <Button type='submit' variant='contained' className='!bg-[#002f37] !normal-case !rounded-xl !shadow-none'>Save</Button>  
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Material Modal */}
            <Dialog open={deleteMaterialModal} onClose={() => !deletingMaterial && setDeleteMaterialModal(false)} maxWidth='xs' fullWidth>  
                <DialogTitle className='!font-bold !text-slate-800'>Delete Material</DialogTitle>  
                <DialogContent>
                    <DialogContentText className='!text-slate-600 text-sm'>
                        Are you sure you want to delete <span className='font-semibold text-slate-800'>"{materialToDelete?.title}"</span>?  
                    </DialogContentText>
                </DialogContent>
                <DialogActions className='!px-4 !pb-3'>
                    <Button onClick={() => setDeleteMaterialModal(false)} disabled={deletingMaterial} className='!normal-case !text-slate-600'>Cancel</Button>  
                    <Button onClick={handleConfirmDeleteMaterial} variant='contained' color='error' disabled={deletingMaterial} className='!normal-case !rounded-lg !shadow-none'>  
                        {deletingMaterial ? 'Deleting...' : 'Delete'}  
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Announcement Modal */}
            <Dialog open={openAnnounceModal} onClose={() => setOpenAnnounceModal(false)} fullWidth maxWidth='sm'>  
                <DialogTitle className='!font-bold !text-slate-800'>Post Announcement</DialogTitle>  
                <DialogContent>
                    <div className='flex flex-col gap-4 mt-2'>
                        <TextField
                            fullWidth
                            label='Title'
                            value={announceForm.title}
                            onChange={e => setAnnounceForm(p => ({ ...p, title: e.target.value }))}  
                        />
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label='Content'
                            value={announceForm.content}
                            onChange={e => setAnnounceForm(p => ({ ...p, content: e.target.value }))}  
                        />
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-4'>
                    <Button onClick={() => setOpenAnnounceModal(false)} className='!normal-case !text-slate-600'>Cancel</Button>  
                    <Button variant='contained' onClick={handleAddAnnouncement} className='!bg-[#002f37] !normal-case !rounded-xl !shadow-none'>Post</Button>  
                </DialogActions>
            </Dialog>

            {/* Overview Edit Modal */}
            <Dialog open={openOverviewModal} onClose={() => setOpenOverviewModal(false)} fullWidth maxWidth='sm'>  
                <DialogTitle className='!font-bold !text-slate-800'>Edit Course Overview</DialogTitle>  
                <DialogContent>
                    <div className='flex flex-col gap-4 mt-2'>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label='Description'
                            value={overviewForm.description}
                            onChange={e => setOverviewForm(p => ({ ...p, description: e.target.value }))}  
                        />
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label='Learning Objectives (one per line)'
                            value={overviewForm.objectivesText}
                            onChange={e => setOverviewForm(p => ({ ...p, objectivesText: e.target.value }))}  
                        />
                        <div className='grid grid-cols-2 gap-3'>
                            <TextField
                                fullWidth
                                label='Schedule'
                                value={overviewForm.schedule}
                                onChange={e => setOverviewForm(p => ({ ...p, schedule: e.target.value }))}  
                            />
                            <TextField
                                fullWidth
                                label='Room'
                                value={overviewForm.room}
                                onChange={e => setOverviewForm(p => ({ ...p, room: e.target.value }))}  
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-4'>
                    <Button onClick={() => setOpenOverviewModal(false)} className='!normal-case !text-slate-600'>Cancel</Button>  
                    <Button variant='contained' onClick={handleSaveOverview} className='!bg-[#002f37] !normal-case !rounded-xl !shadow-none'>Save</Button>  
                </DialogActions>
            </Dialog>

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
        </div>
    )
}