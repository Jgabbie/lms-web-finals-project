require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const instructorRouter = require('./routes/instructorRouter')
const authRouter = require('./routes/authRouter')
const logsRouter = require('./routes/logsRouter')
const profileRouter = require('./routes/profileRouter')
const userRouter = require('./routes/userRouter')
const notificationRouter = require('./routes/notificationRouter')
const studentRouter = require('./routes/studentRouter')

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


app.use('/api/courses', require('./routes/courseRouter'))
app.use('/api/materials', require('./routes/materialRouter'))
app.use('/api/assignments', require('./routes/assignmentRouter'))

app.use('/api/instructors', instructorRouter)
app.use('/api/auth', authRouter)
app.use('/api/logs', logsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/students', studentRouter)
app.use('/api/user', userRouter)
app.use('/api/users', userRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/discussions', require('./routes/discussionRouter'))


app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`))