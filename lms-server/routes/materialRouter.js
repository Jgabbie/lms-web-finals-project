const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const { getAllMaterials, uploadMaterial } = require('../controllers/materialController')

router.get('/', getAllMaterials)
router.post('/upload', verifyToken, uploadMaterial)

module.exports = router