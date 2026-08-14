const express = require('express')
const router = express.Router()
const {
    getCommentbyId
} = require('../controllers/commentController')

router.put('/comment', comment)
module.exports = router;