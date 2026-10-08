const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2
const multer = require('multer')
const { Readable } = require('stream')
const User = require('../models/User')
const { verifyToken } = require('../middleware/authMiddleware')

const { getProfile, updateProfile, deleteProfile, sendPasswordResetOtp, resetPassword, resendPasswordResetOtp, uploadProfileImage } = require('../controllers/profileController')

router.get('/profile', verifyToken, getProfile)
router.put('/profile', verifyToken, updateProfile)
router.delete('/profile', verifyToken, deleteProfile)
router.post('/change-password/send-otp', sendPasswordResetOtp)
router.post('/change-password/reset', resetPassword)
router.post('/change-password/resend-otp', resendPasswordResetOtp)
router.post('/profile/upload-image', verifyToken, uploadProfileImage)



module.exports = router;