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