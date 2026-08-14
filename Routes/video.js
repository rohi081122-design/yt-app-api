const express = require('express')
const router = express.Router()
const {upload} = require('../controllers/videoController')

router.post('/upload',upload)

module.exports = router