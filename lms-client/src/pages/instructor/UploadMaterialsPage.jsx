import RoleScreen from '../../components/StudentScreen'
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
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material'
import {
    AddRounded as Add,
    DescriptionRounded as DescriptionOutlined,
    InsertDriveFileRounded as InsertDriveFileOutlined,
    MenuBookRounded as MenuBookOutlined,
    PictureAsPdfRounded as PictureAsPdfOutlined,
    SearchRounded as Search,
    SlideshowRounded as SlideshowOutlined,
    VideoLibraryRounded as VideoLibraryOutlined,
    CheckCircleRounded as CheckCircle,
    EditRounded as Edit,
    DeleteRounded as Delete,
    VisibilityRounded as VisibilityOutlined,
    DownloadRounded as DownloadOutlined
} from '@mui/icons-material'
import NavbarInstructor from '../../components/NavbarInstructor'
import SidebarInstructor from '../../components/SidebarInstructor'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axiosClient'
import { getStoredProfile } from '../../utils/profileStorage'

export default function UploadMaterialsPage() {
    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('All')
    const [typeFilter, setTypeFilter] = useState('All')
    const [openUpload, setOpenUpload] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [materials, setMaterials] = useState([])
    const [courses, setCourses] = useState([])
    const [selectedFileObj, setSelectedFileObj] = useState(null)
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' })
    const fileInputRef = useRef(null)

    const profile = getStoredProfile()
    const instructorFullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'Instructor'

    const [form, setForm] = useState({
        title: '',
        course: '',
        type: 'PDF',
        description: '',
        fileName: '',
        fileSize: ''
    })

    const [openEdit, setOpenEdit] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({
        title: '',
        course: '',
        type: 'PDF',
        description: ''
    })

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedDeleteMaterial, setSelectedDeleteMaterial] = useState(null)
    const [deleting, setDeleting] = useState(false)

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
    }, [form.course])

    useEffect(() => {
        fetchMaterials()
    }, [fetchMaterials])

    const handleFormChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFileObj(file)
            setForm(prev => ({
                ...prev,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            }))
        }
    }

    const handleUploadSubmit = async () => {
        if (!form.title.trim()) {
            setNotification({ open: true, message: 'Please provide a material title', severity: 'error' })
            return
        }

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('title', form.title.trim())
            formData.append('course', form.course || 'General')
            formData.append('type', form.type)
            formData.append('description', form.description.trim())
            formData.append('instructor', instructorFullName)

            if (selectedFileObj) {
                formData.append('file', selectedFileObj)
            }

            await api.post('/materials/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setNotification({ open: true, message: 'Material uploaded and hosted successfully!', severity: 'success' })
            setOpenUpload(false)
            setSelectedFileObj(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
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
        } finally {
            setUploading(false)
        }
    }

    // FUNCTIONAL VIEW HANDLER
    const handleViewMaterial = (material) => {
        if (!material.fileUrl) {
            setNotification({ open: true, message: 'No hosted file available to view.', severity: 'warning' })
            return
        }
        window.open(material.fileUrl, '_blank', 'noopener,noreferrer')
    }

    // FUNCTIONAL DOWNLOAD HANDLER
    const handleDownloadMaterial = async (material) => {
        if (!material.fileUrl) {
            setNotification({ open: true, message: 'No downloadable file attached.', severity: 'warning' })
            return
        }

        try {
            const response = await fetch(material.fileUrl)
            if (!response.ok) throw new Error('Network error downloading file')
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = material.fileName || `${material.title.replace(/\s+/g, '_')}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)

            setNotification({ open: true, message: 'Download started!', severity: 'success' })
        } catch (err) {
            console.error('Download failed:', err)
            // Fallback direct browser download
            const link = document.createElement('a')
            link.href = material.fileUrl
            link.target = '_blank'
            link.download = material.fileName || `${material.title}.pdf`
            link.click()
        }
    }

    const handleOpenEdit = (material) => {
        setEditingId(material._id)
        setEditForm({
            title: material.title || '',
            course: material.course || '',
            type: material.type || 'PDF',
            description: material.description || ''
        })
        setOpenEdit(true)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        if (!editForm.title.trim()) {
            setNotification({ open: true, message: 'Title is required', severity: 'error' })
            return
        }
        try {
            await api.put(`/materials/${editingId}`, editForm)
            setNotification({ open: true, message: 'Material updated successfully!', severity: 'success' })
            setOpenEdit(false)
            setEditingId(null)
            fetchMaterials()
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to update material',
                severity: 'error'
            })
        }
    }

    const handleOpenDelete = (material) => {
        setSelectedDeleteMaterial(material)
        setDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedDeleteMaterial) return
        try {
            setDeleting(true)
            await api.delete(`/materials/${selectedDeleteMaterial._id}`)
            setNotification({ open: true, message: 'Material deleted successfully', severity: 'success' })
            setMaterials(prev => prev.filter(m => m._id !== selectedDeleteMaterial._id))
            setDeleteModalOpen(false)
            setSelectedDeleteMaterial(null)
        } catch (err) {
            setNotification({
                open: true,
                message: err.response?.data?.message || 'Failed to delete material',
                severity: 'error'
            })
        } finally {
            setDeleting(false)
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
        <RoleScreen page="uploadmaterialspage" role="instructor">
            <div className='min-h-screen bg-slate-50'>
                <NavbarInstructor sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <SidebarInstructor open={sidebarOpen} setOpen={setSidebarOpen} />
                <div
                    className='transition-all duration-300'
                    style={{ marginLeft: sidebarOpen ? '260px' : '72px' }}
                >
                    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                        <div className='student-page-heading flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                            <div>
                                <Typography variant='h4' className='!font-bold !text-slate-800'>
                                    Learning Materials
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Upload, edit, view, and download materials.
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

                        <div className='student-stat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
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
                                        slotProps={{ input: { startAdornment: <Search className='!text-slate-400 !mr-2' /> } }}
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
                                                <th className='text-right font-semibold px-6 py-4'>Actions</th>
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
                                                            <div>
                                                                <Typography
                                                                    onClick={() => handleViewMaterial(material)}
                                                                    className={`!font-semibold !text-slate-800 ${
                                                                        material.fileUrl ? 'hover:!text-blue-600 hover:underline cursor-pointer' : ''
                                                                    }`}
                                                                >
                                                                    {material.title}
                                                                </Typography>
                                                                <Typography variant='caption' className='!text-slate-400 block'>
                                                                    Uploaded by {material.instructor}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>{material.course}</td>
                                                    <td className='px-6 py-4'>
                                                        <Chip size='small' label={material.type} variant='outlined' />
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>
                                                        {new Date(material.createdAt || Date.now()).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className='px-6 py-4 text-slate-600'>{material.fileSize}</td>
                                                    <td className='px-6 py-4 text-right'>
                                                        <div className='flex items-center justify-end gap-1.5'>
                                                            {/* VIEW BUTTON */}
                                                            <Tooltip title='View'>
                                                                <span>
                                                                    <IconButton
                                                                        size='small'
                                                                        onClick={() => handleViewMaterial(material)}
                                                                        disabled={!material.fileUrl}
                                                                        className='!text-blue-600 hover:!bg-blue-50'
                                                                    >
                                                                        <VisibilityOutlined fontSize='small' />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>

                                                            {/* DOWNLOAD BUTTON */}
                                                            <Tooltip title='Download File'>
                                                                <span>
                                                                    <IconButton
                                                                        size='small'
                                                                        onClick={() => handleDownloadMaterial(material)}
                                                                        disabled={!material.fileUrl}
                                                                        className='!text-slate-600 hover:!bg-slate-100'
                                                                    >
                                                                        <DownloadOutlined fontSize='small' />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>

                                                            {/* EDIT BUTTON */}
                                                            <Tooltip title='Edit Details'>
                                                                <IconButton
                                                                    size='small'
                                                                    color='primary'
                                                                    onClick={() => handleOpenEdit(material)}
                                                                    className='!text-slate-700 hover:!bg-slate-100'
                                                                >
                                                                    <Edit fontSize='small' />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {/* DELETE BUTTON */}
                                                            <Tooltip title='Delete Material'>
                                                                <IconButton
                                                                    size='small'
                                                                    color='error'
                                                                    onClick={() => handleOpenDelete(material)}
                                                                    className='!text-red-600 hover:!bg-red-50'
                                                                >
                                                                    <Delete fontSize='small' />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
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

                {/* UPLOAD MODAL */}
                <Dialog
                    open={openUpload}
                    onClose={() => !uploading && setOpenUpload(false)}
                    fullWidth
                    maxWidth='sm'
                    slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
                >
                    <DialogTitle className='!font-bold !text-slate-800 !pb-2'>
                        Upload Learning Material
                    </DialogTitle>
                    <DialogContent className='!pt-4'>
                        <div className='flex flex-col gap-5 pt-2'>
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
                                className='!normal-case !rounded-xl !border-slate-300 !text-slate-700 !py-3'
                            >
                                {form.fileName ? form.fileName : 'Choose File'}
                                <input
                                    ref={fileInputRef}
                                    hidden
                                    type='file'
                                    accept='.pdf, .doc, .docx, .ppt, .pptx, .zip, .rar, .png, .jpg, .jpeg, .mp4'
                                    onChange={handleFileSelect}
                                />
                            </Button>
                            {form.fileName && (
                                <div className='flex items-center gap-2 text-emerald-600 text-sm font-medium'>
                                    <CheckCircle fontSize='small' />
                                    <span>{form.fileName} ({form.fileSize})</span>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                    <DialogActions className='!px-6 !pb-4 !pt-2'>
                        <Button
                            onClick={() => setOpenUpload(false)}
                            disabled={uploading}
                            className='!normal-case !text-slate-600'
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            onClick={handleUploadSubmit}
                            disabled={uploading}
                            className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                        >
                            {uploading ? 'Uploading...' : 'Upload Material'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* EDIT MODAL */}
                <Dialog
                    open={openEdit}
                    onClose={() => setOpenEdit(false)}
                    fullWidth
                    maxWidth='sm'
                    slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
                >
                    <DialogTitle className='!font-bold !text-slate-800 !pb-2'>
                        Edit Learning Material
                    </DialogTitle>
                    <form onSubmit={handleEditSubmit}>
                        <DialogContent className='!pt-4'>
                            <div className='flex flex-col gap-5 pt-2'>
                                <TextField
                                    fullWidth
                                    required
                                    label='Material Title'
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    label='Course'
                                    value={editForm.course}
                                    onChange={(e) => setEditForm(p => ({ ...p, course: e.target.value }))}
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
                                    value={editForm.type}
                                    onChange={(e) => setEditForm(p => ({ ...p, type: e.target.value }))}
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
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions className='!px-6 !pb-4 !pt-2'>
                            <Button onClick={() => setOpenEdit(false)} className='!normal-case !text-slate-600'>
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='contained'
                                className='!bg-slate-900 hover:!bg-slate-800 !normal-case !rounded-xl !px-5 !py-2 !shadow-none'
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* DELETE MODAL */}
                <Dialog
                    open={deleteModalOpen}
                    onClose={() => !deleting && setDeleteModalOpen(false)}
                    maxWidth='xs'
                    fullWidth
                    slotProps={{ paper: { className: '!rounded-2xl !p-2' } }}
                >
                    <DialogTitle className='!font-bold !text-slate-800'>
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText className='!text-slate-600'>
                            Are you sure you want to delete <span className='font-semibold text-slate-800'>"{selectedDeleteMaterial?.title}"</span>? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions className='!px-4 !pb-3'>
                        <Button
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={deleting}
                            className='!normal-case !text-slate-600'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant='contained'
                            color='error'
                            disabled={deleting}
                            className='!normal-case !rounded-lg !shadow-none'
                        >
                            {deleting ? 'Deleting...' : 'Delete Material'}
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
        </RoleScreen>
    )
}