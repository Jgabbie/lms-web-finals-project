const router = require('express').Router()

const {
    login,
    register,
    logout,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    forgotPasswordSendOtp,
    resetPassword,
    verifyPasswordResetOtp,
} = require('../controllers/authController')

router.post('/login', login)
router.post('/register', register)
router.post('/register/send-otp', sendRegistrationOtp)
router.post('/register/verify-otp', verifyRegistrationOtp)
router.post('/register/resend-otp', resendRegistrationOtp)
router.post('/forgot-password/send-otp', forgotPasswordSendOtp)
router.post('/forgot-password/reset', resetPassword)
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp)
router.post('/logout', logout)

module.exports = router;