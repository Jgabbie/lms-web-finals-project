const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: "No Token" })
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' })
        req.user = decoded
<<<<<<< HEAD
        next()
=======
        next() // <--- MUST BE CALLED HERE
>>>>>>> 416a99d0566c0bb1cbbe5975cd8d33d0338420d7
    })
}

function isAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin Only' })
    }
    next()
}

function isInstructor(req, res, next) {
    if (req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Instructor Only' })
    }
    next()
}

module.exports = { verifyToken, isAdmin, isInstructor }