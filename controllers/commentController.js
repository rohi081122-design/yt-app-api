const Comment = require('../model/Comment')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// Add new comment 
const addCommentbyId = async (req, res) => {
    try {
        // const channelId = req.params.channelId
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const newComment = new Comment({
            commentText: req.body.text,
            videoId: req.body.videoId,
            subscribeId: tokenData._id
        })

        const saveComment = await newComment.save()
        
        res.status(200).json({
            message: "Comment added successfully",
            newComment: saveComment
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }


}

module.exports = { getCommentbyId }