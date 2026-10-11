const Material = require('../models/Material')

// Get all learning materials
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 })
        res.status(200).json(materials)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch materials' })
    }
}

// Upload/create a new learning material
exports.uploadMaterial = async (req, res) => {
    try {
        const material = await Material.create({
            ...req.body,
            instructorId: req.user.id
        })
        res.status(201).json({ message: 'Material uploaded successfully', material })
    } catch (err) {
        res.status(500).json({ message: 'Upload failed' })
    }
}

// Update an existing material
exports.updateMaterial = async (req, res) => {
    try {
        const { title, course, type, description } = req.body
        const material = await Material.findById(req.params.id)
        if (!material) {
            return res.status(404).json({ message: 'Material not found' })
        }

        if (title !== undefined) material.title = title.trim()
        if (course !== undefined) material.course = course
        if (type !== undefined) material.type = type
        if (description !== undefined) material.description = description.trim()

        await material.save()
        res.status(200).json({ message: 'Material updated successfully', material })
    } catch (err) {
        console.error('Update material error:', err)
        res.status(500).json({ message: 'Failed to update material' })
    }
}

// Delete a learning material
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