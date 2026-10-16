const express = require('express')
const router = express.Router()
const {
    signup,
    login,
    subscribe,
    unsubscribe,
    uploadProfile,
    uploadCoverProfilePic,

    getChannelInfo,
    getUserInfo,
    updateChannelDetail,
    logout
} = require('../controllers/userController')

router.post('/signup',signup)
router.post('/login',login)

router.put('/uploadProfile',uploadProfile)
router.put('/uploadCoverPic',uploadCoverProfilePic)

router.put('/subscribe/:channelId',subscribe)
router.put('/unsubscribe/:channelId',unsubscribe)

router.get('/getChannelInfo/:channelId', getChannelInfo); // check
router.get('/getUserInfo', getUserInfo); // check

router.put('/updateChannelDetail/:channelId', updateChannelDetail); // check
router.delete('/logout', logout)

module.exports = router