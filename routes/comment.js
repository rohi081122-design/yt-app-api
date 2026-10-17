const express = require('express')  
const router = express.Router()
const {
    addCommentbyId,
    getAllComment,
    editComment,
    deleteComment,
    commentLikeUnlike,
    commentDislikeUndislike
} = require('../controllers/commentController')


router.post('/addComment/:videoId', addCommentbyId)
router.get('/getComment/:videoId', getAllComment)

router.put('/edit/:commentId', editComment)
router.delete('/delete/:commentId', deleteComment)

router.put('/likeUnlike/:commentId', commentLikeUnlike)
router.put('dislikeUndislike/:commentId', commentDislikeUndislike)

module.exports = router;