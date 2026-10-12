require('dotenv').config()
const path = require('path')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2
const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const Course = require('../models/Course')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// 1. Get all assignments
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 })
        res.status(200).json(assignments)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch assignments' })
    }
}

// 2. Instructor: Create assignment with optional Cloudinary attachment
exports.createAssignment = async (req, res) => {
    try {
        const { title, course, dueDate, points, description } = req.body
        if (!title || !course) {
            return res.status(400).json({ message: 'Title and course are required' })
        }

        let fileUrl = ''
        let fileName = ''
        let fileSize = ''

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
                            folder: 'edulearn/assignment-attachments',
                            resource_type: 'auto',
                            public_id: `${Date.now()}-${baseName}`,
                            format: fileExt || undefined,
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

        const selectedCourse = await Course.findOne({
            $or: [{ courseName: course }, { courseCode: course }]
        }).select('_id')

        const assignment = await Assignment.create({
            title: title.trim(),
            course,
            courseId: selectedCourse?._id,
            dueDate: dueDate || 'No Due Date',
            points: Number(points) || 100,
            description: description?.trim() || '',
            instructorId: req.user.id,
            fileUrl,
            fileName,
            fileSize
        })

        res.status(201).json({ message: 'Assignment created successfully', assignment })
    } catch (err) {
        console.error('Assignment creation error:', err)
        res.status(500).json({ message: err.message || 'Failed to create assignment' })
    }
}

// 3. Instructor: Update assignment
exports.updateAssignment = async (req, res) => {
    try {
        const { title, course, dueDate, points, description } = req.body
        const assignment = await Assignment.findById(req.params.id)
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' })

        if (title !== undefined) assignment.title = title.trim()
        if (course !== undefined) {
            assignment.course = course
            const selectedCourse = await Course.findOne({
                $or: [{ courseName: course }, { courseCode: course }]
            }).select('_id')
            assignment.courseId = selectedCourse?._id
        }
        if (dueDate !== undefined) assignment.dueDate = dueDate
        if (points !== undefined) assignment.points = Number(points) || 100
        if (description !== undefined) assignment.description = description.trim()

        if (req.file) {
            assignment.fileName = req.file.originalname
            assignment.fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`

            const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase()
            const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname))
                .replace(/[^a-zA-Z0-9_-]/g, '_')

            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'edulearn/assignment-attachments',
                            resource_type: 'auto',
                            public_id: `${Date.now()}-${baseName}`,
                            format: fileExt || undefined,
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
            assignment.fileUrl = uploadResult.secure_url
        }

        await assignment.save()
        res.status(200).json({ message: 'Assignment updated successfully', assignment })
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to update assignment' })
    }
}

// 4. Instructor: Delete assignment
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id)
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' })
        await Submission.deleteMany({ assignmentId: req.params.id })
        res.status(200).json({ message: 'Assignment and related submissions deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete assignment' })
    }
}

// 5. Get all submissions (for grading)
exports.getSubmissions = async (req, res) => {
    try {
        const query = req.user?.role === 'student' ? { studentId: req.user.id } : {}
        const submissions = await Submission.find(query).sort({ createdAt: -1 })
        res.status(200).json(submissions)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch submissions' })
    }
}

// 6. Instructor: Grade a submission
exports.gradeSubmission = async (req, res) => {
    try {
        const { score, feedback } = req.body
        const submission = await Submission.findById(req.params.id)
        if (!submission) return res.status(404).json({ message: 'Submission not found' })
        submission.score = Number(score)
        submission.feedback = feedback || ''
        submission.status = 'Graded'
        await submission.save()
        res.status(200).json({ message: 'Grade saved successfully', submission })
    } catch (err) {
        res.status(500).json({ message: 'Failed to grade submission' })
    }
}


exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId, assignmentTitle, course, studentName, studentEmail } = req.body

        let fileUrl = ''
        let fileName = 'submission.zip'

        if (req.file) {
            fileName = req.file.originalname
            const fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase()
            const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname))
                .replace(/[^a-zA-Z0-9_-]/g, '_')

            const uploadToCloudinary = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'edulearn/student-submissions',
                            resource_type: 'auto',
                            public_id: `${Date.now()}-${baseName}`,
                            format: fileExt || undefined,
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

        const submission = await Submission.create({
            assignmentId,
            assignmentTitle,
            course,
            studentId: req.user.id,
            studentName,
            studentEmail,
            file: fileName,
            fileUrl,
            submittedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        })

        res.status(201).json({ message: 'Assignment submitted successfully', submission })
    } catch (err) {
        console.error('Submit assignment error:', err)
        res.status(500).json({ message: err.message || 'Failed to submit assignment' })
    }
}