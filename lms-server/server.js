require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.json())


mongoose.connect((process.env.MONGO_URI))
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('Connection error', err.message))


app.get('/', (req, res) => {
    res.send('LMS API is running....')
})

app.use('/api/auth', require('./routes/authRouter'))
app.use('/api/user', require('./routes/userRouter'))
<<<<<<< HEAD
app.use('/api/profile', require('./routes/profileRouter'))
=======
app.use('/api/courses', require('./routes/courseRouter'))
app.use('/api/materials', require('./routes/materialRouter'))
>>>>>>> 416a99d0566c0bb1cbbe5975cd8d33d0338420d7
app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`))