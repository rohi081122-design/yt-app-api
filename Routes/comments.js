const express = require('express')
const router = express.Router()
const {
    getCommentbyId,
    // addComment,
    editComment,
    deleteComment,
    likeUnlike,
    dislikeUndislike
} = require('../controllers/commentController')


router.put('/comment', comment)
// router.post('/addComment/:videoId', addComment)   // by sachi
router.put('/:commentId', editComment)
router.delete('/:commentId', deleteComment)
router.put('/likeUnlike/:commentId', likeUnlike)
router.put('dislikeUndislike/:comment', dislikeUndislike)

module.exports = router;