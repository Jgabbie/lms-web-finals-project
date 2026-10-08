import { Card, CardContent, Typography, Button, TextField, Chip, MenuItem, CircularProgress } from '@mui/material'
import {
    DescriptionOutlined,
    DownloadOutlined,
    InsertDriveFileOutlined,
    MenuBookOutlined,
    PictureAsPdfOutlined,
    Search,
    SlideshowOutlined,
    VideoLibraryOutlined,
    VisibilityOutlined
} from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { useState, useEffect, useMemo, useCallback } from 'react'
import api from '../../api/axiosClient'

export default function LearningMaterialsPage() {
    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('All')
    const [typeFilter, setTypeFilter] = useState('All')
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchMaterials = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get('/materials')
            setMaterials(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error('Failed to fetch materials:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMaterials()
    }, [fetchMaterials])

    const filteredMaterials = useMemo(() => {
        const key = search.toLowerCase()
        return materials.filter(material => {
            const matchesSearch =
                (material.title || '').toLowerCase().includes(key) ||
                (material.description || '').toLowerCase().includes(key) ||
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

    const courses = ['All', ...new Set(materials.map(item => item.course).filter(Boolean))]
    const types = ['All', ...new Set(materials.map(item => item.type).filter(Boolean))]

    return (
        <>
            <Navbar />
            <Sidebar />
            <div className='min-h-screen bg-slate-50'>
                <main className='ml-0 lg:ml-[260px] transition-all max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>
                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Learning Materials
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                View and download learning resources from your enrolled courses.
                            </Typography>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        {[
                            ['Total Materials', materials.length],
                            ['PDF Files', materials.filter(item => item.type === 'PDF').length],
                            ['Presentations', materials.filter(item => item.type === 'Presentation').length],
                            ['Videos & Docs', materials.filter(item => item.type === 'Video' || item.type === 'Document').length],
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
                                    placeholder='Search learning materials...'
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
                                    {courses.map(course => (
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
                                            {type === 'All' ? 'All File Types' : type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className='py-20 flex justify-center'>
                            <CircularProgress />
                        </div>
                    ) : filteredMaterials.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6'>
                            {filteredMaterials.map(material => (
                                <Card
                                    key={material._id}
                                    className='!rounded-xl !border !border-slate-200 !shadow-sm hover:!shadow-md transition-shadow'
                                >
                                    <CardContent className='!p-6'>
                                        <div className='flex items-start justify-between gap-4'>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getIconClass(material.type)}`}>
                                                {getIcon(material.type)}
                                            </div>
                                            <Chip size='small' label={material.type} variant='outlined' />
                                        </div>
                                        <Typography variant='h6' className='!font-bold !text-slate-800 !mt-5'>
                                            {material.title}
                                        </Typography>
                                        <Typography variant='body2' className='!text-blue-600 !font-medium !mt-1'>
                                            {material.course}
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !leading-6 !mt-3 line-clamp-2'>
                                            {material.description || 'No description provided.'}
                                        </Typography>
                                        <div className='border-t border-slate-100 mt-5 pt-4'>
                                            <Typography variant='caption' className='!block !text-slate-500'>
                                                Uploaded by {material.instructor || 'Instructor'}
                                            </Typography>
                                            <div className='flex items-center justify-between mt-1'>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    {new Date(material.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </Typography>
                                                <Typography variant='caption' className='!text-slate-400'>
                                                    {material.fileSize}
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-2 gap-3 mt-5'>
                                            <Button
                                                variant='outlined'
                                                startIcon={<VisibilityOutlined />}
                                                className='!normal-case !rounded-lg !border-slate-300 !text-slate-700'
                                                onClick={() => alert(`Opening preview for ${material.fileName || material.title}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant='contained'
                                                startIcon={<DownloadOutlined />}
                                                className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                                                onClick={() => alert(`Downloading ${material.fileName || 'file'}...`)}
                                            >
                                                Download
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className='!rounded-xl !border !border-slate-200 !shadow-sm mt-6'>
                            <CardContent className='!py-16 !text-center'>
                                <MenuBookOutlined className='!text-slate-300 !text-5xl' />
                                <Typography variant='h6' className='!font-semibold !text-slate-700 !mt-3'>
                                    No learning materials found
                                </Typography>
                                <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                    Your instructors haven't uploaded any resources matching this criteria.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </>
    )
}