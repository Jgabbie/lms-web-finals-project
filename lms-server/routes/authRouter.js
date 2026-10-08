const router = require('express').Router()

const {
    login,
    logout,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    sendPasswordResetOtp,
    forgotPasswordResendOtp,
    resetPassword,
    verifyPasswordResetOtp,
} = require('../controllers/authController')

router.post('/login', login)
router.post('/register/send-otp', sendRegistrationOtp)
router.post('/register/verify-otp', verifyRegistrationOtp)
router.post('/register/resend-otp', resendRegistrationOtp)
router.post('/forgot-password/send-otp', sendPasswordResetOtp)
router.post('/forgot-password/reset', resetPassword)
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp)
router.post('/forgot-password/resend-otp', forgotPasswordResendOtp)
router.post('/logout', logout)

module.exports = router;