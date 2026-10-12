import RoleScreen from '../../components/StudentScreen'
import {
    Avatar,
    Typography,
    Button,
    Divider,
    Tab,
    Tabs
} from '@mui/material'
import {
    CalendarTodayRounded as CalendarToday,
    MeetingRoomRounded as MeetingRoom,
    PersonRounded as Person,
    MenuBookRounded as MenuBook,
    AssignmentRounded as Assignment,
    SchoolRounded as School,
    CheckCircleRounded as CheckCircle,
    InsertDriveFileRounded as InsertDriveFile,
    PictureAsPdfRounded as PictureAsPdf,
    SlideshowRounded as Slideshow,
    VideoLibraryRounded as VideoLibrary,
    DescriptionRounded as Description,
    VisibilityRounded as Visibility,
    DownloadRounded as Download
} from '@mui/icons-material'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import api from '../../api/axiosClient'

export default function CourseDetailsPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const [activeTab, setActiveTab] = useState(0)
    const [loading, setLoading] = useState(true)
    const [course, setCourse] = useState(null)
    const [materials, setMaterials] = useState([])
    const [courseAssignments, setCourseAssignments] = useState([])

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
                        String(m.courseId) === String(currentCourse._id) ||
                        [currentCourse.courseName, currentCourse.courseCode].some(courseValue =>
                            String(m.course || '').trim().toLowerCase() === String(courseValue || '').trim().toLowerCase()
                        )
                    )) 
                }

                if (Array.isArray(allAssignmentsRes.data)) {
                    setCourseAssignments(allAssignmentsRes.data.filter(a => 
                        String(a.courseId) === String(currentCourse._id) ||
                        [currentCourse.courseName, currentCourse.courseCode].some(courseValue =>
                            String(a.course || '').trim().toLowerCase() === String(courseValue || '').trim().toLowerCase()
                        )
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
            return 'Instructor'
        }
        return course.instructor
    }, [course?.instructor])

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
        if (!fileUrl) return 
        window.open(fileUrl, '_blank', 'noopener,noreferrer') 
    }

    const handleDownloadFile = async (item) => {
        if (!item.fileUrl) return 
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

    return (
        <RoleScreen page="course-details" role="student">
        <div className='min-h-screen bg-[#f5f8fa]'>
            <Navbar />
            <Sidebar />
            <div className='role-detail-content transition-all duration-300'>
                <main className='max-w-[1300px] mx-auto px-4 sm:px-8 py-7'>
                    {loading || !course ? (
                        <div className='py-20 text-center text-slate-500'>
                            <Typography>Loading course dashboard...</Typography>
                        </div>
                    ) : (
                        <>
                            {/* Deep Teal Hero Card */}
                            <div className='student-page-heading bg-[#002f37] rounded-3xl p-7 sm:p-8 text-white relative shadow-sm mb-6'>
                                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                                    <div>
                                        <div className='flex items-center gap-2 mb-3.5'>
                                            <span className='bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-md font-semibold'>
                                                {course.courseCode}
                                            </span>
                                            <span className='bg-white/10 text-white/90 text-xs px-2.5 py-1 rounded-md font-semibold'>
                                                {course.units || 3} Units 
                                            </span>
                                        </div>

                                        <Typography variant='h3' className='!font-extrabold !text-white !tracking-tight !text-3xl sm:!text-4xl'>
                                            {course.courseName} 
                                        </Typography>

                                        <Typography variant='body2' className='!text-slate-300 !mt-2.5 !max-w-2xl !leading-relaxed'>
                                            {course.description || 'Learn the fundamentals of modern web development using HTML'} 
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

                                    <div className='course-heading-summary bg-[#003d48]/80 border border-white/5 rounded-2xl p-5 min-w-[270px]'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-xs font-semibold text-slate-300'>Course Progress</span> 
                                            <span className='text-sm font-black text-white'>100%</span> 
                                        </div>
                                        <div className='h-2 bg-[#00262c] rounded-full overflow-hidden mt-2.5'>
                                            <div className='h-full bg-amber-400 rounded-full w-full' /> 
                                        </div>
                                        <span className='text-xs text-slate-300 mt-2.5 block'>
                                            {materials.length} of {materials.length || 1} materials available 
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric Cards */}
                            <div className='role-course-stat-grid grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6'>
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

                            {/* Tabs */}
                            <div className='bg-white rounded-2xl border border-slate-200/80 px-6 py-2.5 mb-6 shadow-xs'>
                                <Tabs
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    value={activeTab}
                                    onChange={(_, v) => setActiveTab(v)} 
                                    slotProps={{ indicator: { style: { backgroundColor: '#002f37', height: 3, borderRadius: 2 } } }}
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
                                </Tabs>
                            </div>

                            {/* Tab 0: Overview */}
                            {activeTab === 0 && (
                                <div className='grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6'>
                                    <div>
                                        <Typography variant='h6' className='!font-extrabold !text-slate-800 !mb-2'>
                                            About this course 
                                        </Typography>
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

                            {/* Tab 1: Modules (Materials) */}
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
                                                Course resources will appear here. 
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
                                                    onClick={() => navigate('/student/assignments/details', { state: { assignment: asg } })} 
                                                    className='rounded-full px-5 py-2 text-xs font-bold border border-slate-300 text-slate-700 hover:border-[#002f37] hover:text-[#002f37] transition whitespace-nowrap' 
                                                >
                                                    View Assignment 
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

                        </>
                    )}
                </main>
            </div>
        </div>
        </RoleScreen>
    )
}