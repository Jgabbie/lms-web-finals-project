require('dotenv').config()
const Material = require('../models/Material')
const Course = require('../models/Course')
const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// 1. Get all learning materials
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 })
        res.status(200).json(materials)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch materials' })
    }
}

const path = require('path')

exports.uploadMaterial = async (req, res) => {
    try {
        const { title, course, type, description, instructor } = req.body

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Material title is required' })
        }

        let fileUrl = ''
        let fileName = 'document.pdf'
        let fileSize = '1.0 MB'

        if (req.file) {
            fileName = req.file.originalname
            fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`

            const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase()
            const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname))
                .replace(/[^a-zA-Z0-9_-]/g, '_')

            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'edulearn/learning-materials',
                            resource_type: 'auto', // Keeps PDFs previewable inline
                            public_id: `${Date.now()}-${baseName}`,
                            format: fileExt || undefined, // Ensures .pdf extension remains in the URL
                            access_mode: 'public'
                        },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    Readable.from(req.file.buffer).pipe(stream)
                })
            }

            const uploadResult = await uploadToCloudinary()
            fileUrl = uploadResult.secure_url
        }

        const selectedCourse = course
            ? await Course.findOne({
                $or: [{ courseName: course }, { courseCode: course }]
            }).select('_id')
            : null

        const material = await Material.create({
            title: title.trim(),
            course: course || 'General',
            courseId: selectedCourse?._id,
            type: type || 'PDF',
            description: description?.trim() || '',
            instructor: instructor || 'Instructor',
            instructorId: req.user.id,
            fileUrl: fileUrl,
            fileName: fileName,
            fileSize: fileSize
        })

        res.status(201).json({ message: 'Material uploaded successfully', material })
    } catch (err) {
        console.error('Material upload error:', err)
        res.status(500).json({ message: err.message || 'Failed to upload material' })
    }
}

// 3. Update existing material
exports.updateMaterial = async (req, res) => {
    try {
        const { title, course, type, description } = req.body
        const material = await Material.findById(req.params.id)
        if (!material) {
            return res.status(404).json({ message: 'Material not found' })
        }

        if (title !== undefined) material.title = title.trim()
        if (course !== undefined) {
            material.course = course
            const selectedCourse = await Course.findOne({
                $or: [{ courseName: course }, { courseCode: course }]
            }).select('_id')
            material.courseId = selectedCourse?._id
        }
        if (type !== undefined) material.type = type
        if (description !== undefined) material.description = description.trim()

        await material.save()
        res.status(200).json({ message: 'Material updated successfully', material })
    } catch (err) {
        console.error('Update material error:', err)
        res.status(500).json({ message: 'Failed to update material' })
    }
}

// 4. Delete material
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id)
        if (!material) {
            return res.status(404).json({ message: 'Material not found' })
        }
        res.status(200).json({ message: 'Material deleted successfully' })
    } catch (err) {
        console.error('Delete material error:', err)
        res.status(500).json({ message: 'Failed to delete material' })
    }
}