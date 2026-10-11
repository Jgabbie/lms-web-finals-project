const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const {
    getAllMaterials,
    uploadMaterial,
    updateMaterial,
    deleteMaterial
} = require('../controllers/materialController')

router.get('/', getAllMaterials)
router.post('/upload', verifyToken, uploadMaterial)
router.put('/:id', verifyToken, updateMaterial)
router.delete('/:id', verifyToken, deleteMaterial)

module.exports = router