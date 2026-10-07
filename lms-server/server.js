require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const instructorRouter = require('./routes/instructorRouter')

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
app.use('/api/profile', require('./routes/profileRouter'))
app.use('/api/courses', require('./routes/courseRouter'))
app.use('/api/materials', require('./routes/materialRouter'))
app.use('/api/logs', require('./routes/logsRouter'))

app.use('/api/instructors', instructorRouter)
app.use('/api/assignments', require('./routes/assignmentRouter'))
app.listen(process.env.PORT, () => console.log(`Server on port ${process.env.PORT}`))