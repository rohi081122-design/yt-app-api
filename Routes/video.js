const express = require('express')
const router = express.Router()
const {
    upload,
    getAllVideo,
    getVideoById,
    likeUnlike,
    dislikeUndislike,
    updateVideoDetails,
    deleteVideo,
    getVideoByChannelId,   //check
    allVideoByChannelId     //check
} = require('../controllers/videoController')



router.post('/upload',upload)
router.get('/getAllVideo', getAllVideo)
router.get('/getVideo/:videoId', getVideoById)

router.put('/like/:videoId', likeUnlike)
router.put('/dislike/:videoId', dislikeUndislike)

router.put('/update/:videoId', updateVideoDetails)
router.delete('/delete/:videoId', deleteVideo)

router.get('/videoByChannelId/:channelId', getVideoByChannelId);  //Check
router.get('/allVideoByChannelId/:channelId', allVideoByChannelId);     //check

module.exports = router