const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')

const {
    getProfile,
    updateProfile,
    sendPasswordResetOtp,
    resetPassword,
    resendPasswordResetOtp,
    uploadProfileImage,
    profileImageUpload
} = require('../controllers/profileController')

router.get('/', verifyToken, getProfile)
router.put('/', verifyToken, updateProfile)
router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.post('/change-password/send-otp', sendPasswordResetOtp)
router.post('/change-password/reset', resetPassword)
router.post('/change-password/resend-otp', resendPasswordResetOtp)
router.post('/upload-image', verifyToken, profileImageUpload, uploadProfileImage)
router.post('/profile/upload-image', verifyToken, profileImageUpload, uploadProfileImage)



module.exports = router;