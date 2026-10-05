const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) return res.status(401).json({ message: "No Token" })

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' })

        req.user = decoded
    })
}

function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin Only' })
    }

    next()
}

module.exports = { verifyToken, isAdmin }