const router = require('express').Router()
const Material = require('../models/Material')
const { verifyToken } = require('../middleware/authMiddleware')

// Get materials
router.get('/', async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 })
        res.status(200).json(materials)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch materials' })
    }
})

// Add material record
router.post('/upload', verifyToken, async (req, res) => {
    try {
        const material = await Material.create({
            ...req.body,
            instructorId: req.user.id
        })
        res.status(201).json({ message: 'Material uploaded successfully', material })
    } catch (err) {
        res.status(500).json({ message: 'Upload failed' })
    }
})

module.exports = router