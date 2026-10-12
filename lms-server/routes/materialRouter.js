const router = require('express').Router()
const multer = require('multer')
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial
} = require('../controllers/materialController')

// Multi-format in-memory file parsing
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
})

router.get('/', getAllMaterials)
router.post('/upload', verifyToken, upload.single('file'), uploadMaterial)
router.put('/:id', verifyToken, updateMaterial)
router.delete('/:id', verifyToken, deleteMaterial)

module.exports = router