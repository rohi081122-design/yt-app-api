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

// ======= Edit Comment =============
const editComment = async(req, res) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)

        if(!comment){
            return res.status(404).json({
                message: "Comment not found"
            })
        }
        else if(comment.commentBy.toString() !== tokenData._id){
            return res.status(403).json({
                message: "You are not authorized to edit this comment"
            })
        }
        else{
            const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, {comment: req.body.comment}, {new: true})
            return res.status(200).json({
                message: "Comment Updated successfully",
                Comment: updatedComment
            })
        }

    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

// ======== Like/Unlike Comment============
const likeUnlike = async (req, res) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)

        if(comment.likeBy.includes(tokenData._id)){
            comment.likeBy = comment.likeBy.filter(userId => userId != tokenData._id)
        }
        else{
            if(comment.dislikeBy.includes(tokenData._id)){
                comment.dislikeBy = comment.dislikeBy.filter(userId => userId != tokenData._id)
            }
            comment.likeBy.push(tokenData._id)
        }
        await comment.save()
        res.status(200).json({
            error: err
        })
    }
    catch(err){
        console.log(err)
        res.statu(500).json({
            error: err
        })
    }
}

// ===============Dislike/Undislike Comment===============
const dislikeUndislike = async (req, res) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)

        if(comment.dislikeBy.includes(tokenData._id)){
            comment.dislikeBy = comment.likeBy.filter(userId => userId != tokenData._id)
        }
        else{
            if(comment.likeBy.includes(tokenData._id)){
                comment.likeBy = comment.likeBy.filter(userId => userId != tokenData._id)
            }
            comment.dislikeBy.push(tokenData._id)
        }
        await comment.save()
        res.status(200).json({
            comment: comment
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

// =============Delete Comment ===============
const deleteComment = async (req, res) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        const video = await video.findById(comment.videoId)

        if(comment.commentBy.toString() !== tokenData._id && video.uploadedBy.toString() !== tokenData.userId) {
            return res.status(403).json({
                message: "You are not authorized to delete this comment"
            })
        }
        else{
            const data = await Comment.findByIdAndDelete(req.params.commentId)
            return res.status(200).json({
                message: "Comment deleted successfully"
            })
        }
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

}

module.exports = { 
    getCommentbyId, 
    editComment, 
    likeUnlike, 
    dislikeUndislike,
    deleteComment 
}