const cors = require('cors')
const express = require('express')
const connectDB = require('./configure/db')

const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')

// import routes
const userRoute = require('./routes/user');
const videoRoute = require('./routes/video');
const commentRoute = require('./routes/comment');


const app = express()

connectDB()


app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'   // check
}))

app.use('/user', userRoute)
app.use('/video', videoRoute)
app.use('/comment', commentRoute)



module.exports = app;