import { Card, CardContent, Typography, Button, TextField, Chip, IconButton, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { Add, DescriptionOutlined, InsertDriveFileOutlined, MenuBookOutlined, PictureAsPdfOutlined, Search, SlideshowOutlined, VideoLibraryOutlined, VisibilityOutlined } from '@mui/icons-material'
import Navbar from '../../components/Navbar'
import { useMemo, useState } from 'react'


export default function UploadMaterialsPage() {

    const [search, setSearch] = useState('')
    const [courseFilter, setCourseFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [openUpload, setOpenUpload] = useState('')


    const materials = [
        {
            id: 1,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
        {
            id: 2,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
        {
            id: 3,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
        {
            id: 4,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
        {
            id: 5,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
        {
            id: 6,
            title: 'Introduction to React',
            course: 'Web Development',
            type: 'PDF',
            instructor: 'Prof. AAA',
            date: 'Sep 28, 2026',
            size: '2.4 MB'
        },
    ]

    const filteredMaterials = useMemo(() => {
        const key = search.toLowerCase()
        return materials.filter(material => {
            const matchesSearch =
                material.title.toLowerCase().includes(key) ||
                material.course.toLowerCase().includes(key) ||
                material.instructor.toLowerCase().includes(key)

            const matchesCourse =
                courseFilter === 'All' || material.course === courseFilter
            const matchesType =
                typeFilter === 'All' || material.type === typeFilter

            return matchesSearch && matchesCourse && matchesType
        })
    }, [search, courseFilter, typeFilter])


    const getIcon = type => {
        switch (type) {
            case 'PDF':
                return <PictureAsPdfOutlined />
            case 'Presentation':
                return <SlideshowOutlined />
            case 'Video':
                return <VideoLibraryOutlined />
            case 'Document':
                return <DescriptionOutlined />
            default:
                return <InsertDriveFileOutlined />
        }
    }

    const getIconClass = type => {
        switch (type) {
            case 'PDF':
                return 'bg-red-50 text-red-600'
            case 'Presentation':
                return 'bg-orange-50 text-orange-600'
            case 'Video':
                return 'bg-purple-50 text-purple-600'
            case 'Document':
                return 'bg-blue-50 text-blue-600'
            default:
                return 'bg-slate-100 text-slate-600'
        }
    }

    const courses = ['All', ...new Set(materials.map(item => item.course))]
    const types = ['All', ...new Set(materials.map(item => item.type))]

    return (
        <>
            <Navbar />
            <div className='min-h-screen bg-slate-50'>
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7'>

                        <div>
                            <Typography variant='h4' className='!font-bold !text-slate-800'>
                                Learning Materials
                            </Typography>
                            <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                Access course files, presentations, videos, and other learning resources.
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
                            ['PDF Files', materials.filter(item => item.role === 'PDF').length,],
                            ['Presentations', materials.filter(item => item.role === 'Presentation').length,],
                            ['Videos', materials.filter(item => item.role === 'Video').length,],
                        ].map(([label, value]) => (
                            <Card key={label} className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                                <CardContent className='!p-5'>
                                    <Typography variant='body2' className='!text-slate-500'>
                                        {label}
                                    </Typography>
                                    <Typography variant='h4' className='!font-bold !text-slate-800 !mt-1'>
                                        {value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>


                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-5'>
                            <div className='grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4 p-5 border-b border-slate-200'>
                                <TextField
                                    size='small'
                                    placeholder='Search learning materials...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search className='!text-slate-400 !mr-2' />
                                    }}
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
                                            {type === 'All' ? 'All Courses' : type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='!rounded-xl !border !border-slate-200 !shadow-sm'>
                        <CardContent className='!p-0'>
                            <div className='overflow-x-auto'>
                                <table className='w-full min-w-[1000px] text-sm'>
                                    <thead className='bg-slate-50 text-slate-500'>
                                        <tr>
                                            <th className='text-left font-semibold px-6 py-4'>Materials</th>
                                            <th className='text-left font-semibold px-6 py-4'>Courses</th>
                                            <th className='text-left font-semibold px-6 py-4'>Type</th>
                                            <th className='text-left font-semibold px-6 py-4'>Uploaded By</th>
                                            <th className='text-left font-semibold px-6 py-4'>Date</th>
                                            <th className='text-left font-semibold px-6 py-4'>Size</th>
                                            <th className='text-right font-semibold px-6 py-4'>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className='divide-y divide-slate-100'>
                                        {filteredMaterials.map(material => (
                                            <tr key={material.id} className='hover:bg-slate-50'>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconClass(material.type)}`}>
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

                                                <td className='px-6 py-4 text-slate-600'>{material.instructor}</td>
                                                <td className='px-6 py-4 text-slate-600'>{material.date}</td>
                                                <td className='px-6 py-4 text-slate-600'>{material.size}</td>

                                                <td className='px-6 py-4'>
                                                    <div className='flex justify-end gap-1'>
                                                        <IconButton size='small' title='View'>
                                                            <VisibilityOutlined fontSize='small' />
                                                        </IconButton>
                                                        <IconButton size='small' title='Download'>
                                                            <VisibilityOutlined fontSize='small' />
                                                        </IconButton>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredMaterials.length === 0 && (
                                    <div className='py-14 text-center'>
                                        <MenuBookOutlined className='!text-slate-300 !text-5xl' />
                                        <Typography variant='h6' className='!font-semibold !text-slate-700'>
                                            No learning materials found
                                        </Typography>
                                        <Typography variant='body2' className='!text-slate-500 !mt-1'>
                                            Try changing your search or filters.
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main >
            </div >

            <Dialog
                open={openUpload}
                onClose={() => setOpenUpload(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle
                    className='!font-bold !text-slate-800'
                >
                    Upload Learning Material
                </DialogTitle>

                <DialogContent>
                    <div className='space-y-4 mt-2'>
                        <TextField fullWidth label='Material Title' placeholder='Enter material title' />

                        <TextField
                            select
                            fullWidth
                            label='Course'
                            defaultValue='Web Development'
                        >
                            <MenuItem value='Web Development'>Web Development</MenuItem>
                            <MenuItem value='Database Management'>Database Management</MenuItem>
                            <MenuItem value='Object-Oriented Programming'>Object-Oriented Programming</MenuItem>
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label='Material Type'
                            defaultValue='PDF'
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
                            placeholder='Enter a short description of the material...'
                        />

                        <Button
                            component='label'
                            variant='outlined'
                            fullWidth
                            startIcon={<InsertDriveFileOutlined />}
                            className='!normal-case !rounded-lg !border-slate-300 !text-slate-700 !py-3'
                        >
                            Choose File
                            <input hidden type='file' />
                        </Button>

                    </div>
                </DialogContent>

                <DialogActions className='!px-6 !pb-5'>
                    <Button
                        onClick={() => setOpenUpload(false)}
                        className='!normal-case !text-slate-600'
                    >
                        Cancel
                    </Button>

                    <Button
                        variant='contained'
                        onClick={() => setOpenUpload(false)}
                        className='!bg-blue-600 hover:!bg-blue-700 !normal-case !rounded-lg !shadow-none'
                    >
                        Upload Material
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
