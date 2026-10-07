import {
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Chip,
    IconButton,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Alert
} from '@mui/material'
import {
    Add,
    DescriptionOutlined,
    InsertDriveFileOutlined,
    MenuBookOutlined,
    PictureAsPdfOutlined,
    Search,
    SlideshowOutlined,
    VideoLibraryOutlined,
    CheckCircle
} from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import SidebarInstructor from '../../components/SidebarInstructor'
import { useMemo, useState, useEffect, useCallback } from 'react'
import api from '../../api/axiosClient'

export default function UploadMaterialsPage() {
    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('All')
    const [typeFilter, setTypeFilter] = useState('All')
    const [openUpload, setOpenUpload] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [materials, setMaterials] = useState([])
    const [courses, setCourses] = useState([])
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })

    const [form, setForm] = useState({
        title: '',
        course: '',
        type: 'PDF',
        description: '',
        fileName: '',
        fileSize: ''
    })

    const fetchMaterials = useCallback(async () => {
        try {
            setLoading(true)
            const [matRes, courseRes] = await Promise.all([
                api.get('/materials'),
                api.get('/courses')
            ])
            setMaterials(Array.isArray(matRes.data) ? matRes.data : [])
            const loadedCourses = Array.isArray(courseRes.data) ? courseRes.data : []
            setCourses(loadedCourses)
            if (loadedCourses.length > 0 && !form.course) {
                setForm(prev => ({ ...prev, course: loadedCourses[0].courseName }))
            }
        } catch (err) {
            console.error('Fetch materials error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMaterials()
    }, [fetchMaterials])

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setForm(prev => ({
                ...prev,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            }))
        }
    }

    const handleUploadSubmit = async () => {
        if (!form.title.trim()) {
            setNotification({ open: true, message: 'Please provide a material title', severity: 'error' })
            return
        }

        try {
            await api.post('/materials/upload', {
                title: form.title.trim(),
                course: form.course || 'General',
                type: form.type,
                description: form.description.trim(),
                instructor: 'Instructor Portal',
                fileName: form.fileName || 'document.pdf',
                fileSize: form.fileSize || '1.5 MB'
            })

            setNotification({ open: true, message: 'Material uploaded successfully!', severity: 'success' })
            setOpenUpload(false)
            setForm({
                title: '',
                course: courses[0]?.courseName || '',
                type: 'PDF',
                description: '',
                fileName: '',
                fileSize: ''
            })
            fetchMaterials()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to upload material',
                severity: 'error'
            })
        }
    }

    const filteredMaterials = useMemo(() => {
        const key = search.toLowerCase()
        return materials.filter(material => {
            const matchesSearch =
                (material.title || '').toLowerCase().includes(key) ||
                (material.course || '').toLowerCase().includes(key) ||
                (material.instructor || '').toLowerCase().includes(key)
            const matchesCourse = courseFilter === 'All' || material.course === courseFilter
            const matchesType = typeFilter === 'All' || material.type === typeFilter
            return matchesSearch && matchesCourse && matchesType
        })
    }, [materials, search, courseFilter, typeFilter])

    const getIcon = type => {
        switch (type) {
            case 'PDF': return <PictureAsPdfOutlined />
            case 'Presentation': return <SlideshowOutlined />
            case 'Video': return <VideoLibraryOutlined />
            case 'Document': return <DescriptionOutlined />
            default: return <InsertDriveFileOutlined />
        }
    }

    const getIconClass = type => {
        switch (type) {
            case 'PDF': return 'bg-red-50 text-red-600'
            case 'Presentation': return 'bg-orange-50 text-orange-600'
            case 'Video': return 'bg-purple-50 text-purple-600'
            case 'Document': return 'bg-blue-50 text-blue-600'
            default: return 'bg-slate-100 text-slate-600'
        }
    }

    const courseList = ['All', ...new Set(materials.map(item => item.course).filter(Boolean))]
    const types = ['All', 'PDF', 'Presentation', 'Video', 'Document']

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
            <div
                className='transition-all duration-300'
                style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
            >
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Learning Materials
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Upload and manage documents, presentations, and resources for students.
                            </Typography>
                        </div>
                        <Button
                            variant='contained'
                            startIcon={<Add />}
                            onClick={() => setOpenUpload(true)}
                            className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                        >
                            Upload Material
                        </Button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        {[
                            ['Total Materials', materials.length],
                            ['PDF Files', materials.filter(item => item.type === 'PDF').length],
                            ['Presentations', materials.filter(item => item.type === 'Presentation').length],
                            ['Documents & Videos', materials.filter(item => item.type === 'Document' || item.type === 'Video').length],
                        ].map(([label, value]) => (
                            <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-5'>
                                    <Typography variant='body2' className='!text-slate-500'>{label}</Typography>
                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>{value}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-5'>
                            <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4'>
                                <TextField
                                    size='small'
                                    placeholder='Search materials by title or course...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <Search className='!text-slate-400 !mr-2' /> }}
                                />
                                <TextField
                                    select
                                    size='small'
                                    label='Course'
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                >
                                    {courseList.map(course => (
                                        <MenuItem key={course} value={course}>
                                            {course === 'All' ? 'All Courses' : course}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    size='small'
                                    label='File Type'
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    {types.map(type => (
                                        <MenuItem key={type} value={type}>
                                            {type === 'All' ? 'All Types' : type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm !mt-6'>
                        <CardContent className='!p-0'>
                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[900px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Material</th>
                                            <th className='text-left font-semibold px-6 py-4'>Course</th>
                                            <th className='text-left font-semibold px-6 py-4'>Type</th>
                                            <th className='text-left font-semibold px-6 py-4'>Date</th>
                                            <th className='text-left font-semibold px-6 py-4'>Size</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredMaterials.map(material => (
                                            <tr key={material._id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getIconClass(material.type)}`}>
                                                            {getIcon(material.type)}
                                                        </div>
                                                        <Typography className='!font-semibold !text-slate-800'>
                                                            {material.title}
                                                        </Typography>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>{material.course}</td>
                                                <td className='px-6 py-4'>
                                                    <Chip size='small' label={material.type} variant='outlined' />
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>
                                                    {new Date(material.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </td>
                                                <td className='px-6 py-4 text-slate-600'>{material.fileSize}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredMaterials.length === 0 && (
                                    <div className='py-14 text-center'>
                                        <MenuBookOutlined className='!text-slate-300 !text-5xl' />
                                        <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                            {loading ? 'Loading materials...' : 'No learning materials found'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth maxWidth='sm'>
                <DialogTitle className='!font-bold !text-slate-800'>
                    Upload Learning Material
                </DialogTitle>
                <DialogContent>
                    <div className='space-y-4 mt-2'>
                        <TextField
                            fullWidth
                            required
                            label='Material Title'
                            placeholder='e.g. Chapter 1 - Introduction to Node'
                            value={form.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                        />
                        <TextField
                            select
                            fullWidth
                            label='Course'
                            value={form.course}
                            onChange={(e) => handleFormChange('course', e.target.value)}
                        >
                            {courses.map(c => (
                                <MenuItem key={c._id} value={c.courseName}>
                                    {c.courseName}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label='Material Type'
                            value={form.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                        >
                            <MenuItem value='PDF'>PDF</MenuItem>
                            <MenuItem value='Presentation'>Presentation</MenuItem>
                            <MenuItem value='Video'>Video</MenuItem>
                            <MenuItem value='Document'>Document</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label='Description'
                            placeholder='Brief description of the uploaded material...'
                            value={form.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                        />
                        <Button
                            component='label'
                            variant='outlined'
                            fullWidth
                            startIcon={<InsertDriveFileOutlined />}
                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700 !py-3'
                        >
                            {form.fileName ? form.fileName : 'Choose File'}
                            <input hidden type='file' onChange={handleFileSelect} />
                        </Button>
                        {form.fileName && (
                            <div className='flex items-center gap-2 text-emerald-600 text-sm'>
                                <CheckCircle fontSize='small' />
                                <span>{form.fileName} ({form.fileSize})</span>
                            </div>
                        )}
                    </div>
                </DialogContent>
                <DialogActions className='!px-6 !pb-5'>
                    <Button onClick={() => setOpenUpload(false)} className='!normal-case !text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        onClick={handleUploadSubmit}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Upload Material
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={notification.severity} variant='filled'>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    )
}