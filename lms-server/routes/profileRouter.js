const router = require('express').Router()
const { verifyToken } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const {
    getProfile,
    updateProfile,
    sendPasswordResetOtp,
    resetPassword,
    verifyPasswordResetOtp,
    resendPasswordResetOtp,
    uploadProfileImage
} = require('../controllers/profileController')

router.get('/user', verifyToken, getProfile)
router.put('/user/update', verifyToken, updateProfile)
router.post('/change-password/verify-otp', verifyToken, verifyPasswordResetOtp)
router.post('/change-password/send-otp', sendPasswordResetOtp)
router.post('/change-password/reset', resetPassword)
router.post('/change-password/resend-otp', resendPasswordResetOtp)
router.post('/profile/upload-image', verifyToken, upload.single('profileImage'), uploadProfileImage)



module.exports = router;