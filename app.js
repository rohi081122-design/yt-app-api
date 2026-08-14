const express = require('express')
const connectDB = require('./configure/db')
const userRoute = require('./Routes/user')
const videoRoute = require('./Routes/video')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')

const app = express()

connectDB()



app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}))

app.use('/user',userRoute)
app.use('/video',videoRoute)



module.exports = app;