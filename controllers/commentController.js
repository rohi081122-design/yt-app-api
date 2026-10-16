const Comment = require('../models/Comment')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video');

// Add new comment 
const addCommentbyId = async (req, res) => {
    try {
        // const channelId = req.params.channelId
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        // const newComment = new Comment({
        //     commentText: req.body.text,
        //     videoId: req.body.videoId,
        //     subscribeId: tokenData._id
        // })

        // const saveComment = await newComment.save()

        // res.status(200).json({
        //     message: "Comment added successfully",
        //     newComment: saveComment
        // })
        const video = await Video.findById(req.params.videoId)
        if (!video) {
            return res.status(500).json({
                error: "video not found",
            })
        }
        const comment = new Comment({
            commentBy: tokenData._id,
            videoId: video._id,
            commentText: req.body.commentText
        })
        const uploadedComment = await comment.save()
        res.status(200).json({
            message: "Comment uploaded successfully",
            uploadedComment
        })
        video.comment.push(uploadedComment._id)
        await video.save()

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

// Get Comment 
const getAllComment = async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId).select('comment')
        const comments = await Comment.find({ videoId: req.params.videoId }).populate('commentBy', 'channelName profilePicUrl').select('commentBy commentText commentLike commentDislike')


        if (!video) {
            return res.status(500).json({
                error: "video not found",
            })
        }
        if (!comments) {
            return res.status(500).json({
                error: "comment not found",
            })
        }


        const comment = comments.map(comment => {
            console.log(comment);

            const likeHandler = () => {
                const token = req.headers.authorization.split(" ")[1]
                console.log(token);

                if (token && token !== "null") {
                    const tokenData = jwt.verify(token, process.env.JWT_SECRET)
                    console.log(tokenData, token);
                    console.log(comment)

                    return comment.like.some(id => tokenData._id == id)
                }
            }
            const dislikeHandler = () => {
                const token = req.headers.authorization.split(" ")[1]
                console.log(token);

                if (token && token !== "null") {
                    const tokenData = jwt.verify(token, process.env.JWT_SECRET)
                    console.log(tokenData, token);

                    return comment.disLike.some(id => tokenData._id == id)
                }
            }
            return (
                {
                    _id: comment._id,
                    commentBy: {
                        channelName: comment.commentBy.channelName,
                        profilePicUrl: comment.commentBy.profilePicUrl
                    },
                    commentBy: comment.commentBy,
                    commentText: comment.commentText,
                    isLike: (!req.headers.authorization ? 'false' : likeHandler()),
                    isDislike: (!req.headers.authorization ? 'false' : dislikeHandler()),

                }
            )
        })
        res.status(200).json(comment)
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })

    }
}

// ======= Edit Comment by comment owner=============
const editComment = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)

        // if (!comment) {
        //     return res.status(404).json({
        //         message: "Comment not found"
        //     })
        // }
        // else if (comment.commentBy.toString() !== tokenData._id) {
        //     return res.status(403).json({
        //         message: "You are not authorized to edit this comment"
        //     })
        // }
        // else {
        //     const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, { comment: req.body.comment }, { new: true })
        //     return res.status(200).json({
        //         message: "Comment Updated successfully",
        //         Comment: updatedComment
        //     })
        // }

        if (comment.commentBy.toString() !== tokenData._id) {
            return res.status(500).json({
                message: "you are not allowed"
            })
        }
        comment.commentText = req.body.commentText
        await comment.save()
        res.status(200).json({
            comment: message
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

// ======== Like/Unlike Comment============
const commentLikeUnlike = async (req, res) => {
    try {
        var commentLikeStatus = false

        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        //not check
        // if (comment.likeBy.includes(tokenData._id)) {
        //     comment.likeBy = comment.likeBy.filter(userId => userId != tokenData._id)
        // }
        // else {
        //     if (comment.dislikeBy.includes(tokenData._id)) {
        //         comment.dislikeBy = comment.dislikeBy.filter(userId => userId != tokenData._id)
        //     }
        //     comment.likeBy.push(tokenData._id)
        // }
        // await comment.save()
        // res.status(200).json({
        //     error: err
        // })
        if (comment.like.includes(tokenData._id)) {
            comment.like = comment.like.filter((id) => (tokenData._id !== id.toString()))
            commentLikeStatus = false
        }
        else {
            if (comment.disLike.includes(tokenData._id)) {
                comment.disLike = comment.disLike.filter(id => (id.toString() !== tokenData._id))
            }
            comment.like.push(tokenData._id)
            commentLikeStatus = true

        }
        const commentRes = await comment.save()
        res.status(200).json({
            commentBy: commentRes.commentBy,
            videoId: commentRes.videoId,
            commentText: commentRes.commentText,
            likeStatus: commentLikeStatus,
        })
    }
    catch (err) {
        console.log(err)
        res.statu(500).json({
            error: err.message
        })
    }
}

// ===============Dislike/Undislike Comment===============
const commentDislikeUndislike = async (req, res) => {
    try {
        var commentDislikeStatus = false
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        //not check
        // if (comment.dislikeBy.includes(tokenData._id)) {
        //     comment.dislikeBy = comment.likeBy.filter(userId => userId != tokenData._id)
        // }
        // else {
        //     if (comment.likeBy.includes(tokenData._id)) {
        //         comment.likeBy = comment.likeBy.filter(userId => userId != tokenData._id)
        //     }
        //     comment.dislikeBy.push(tokenData._id)
        // }
        // await comment.save()
        // res.status(200).json({
        //     comment: comment
        // })

        if (comment.disLike.includes(tokenData._id)) {
            comment.disLike = comment.disLike.filter((id) => (tokenData._id !== id.toString()))
            commentDislikeStatus = false
        }
        else {
            if (comment.like.includes(tokenData._id)) {
                comment.like = comment.like.filter(id => (id.toString() !== tokenData._id))
            }
            comment.disLike.push(tokenData._id)
            commentDislikeStatus = true
        }
        const commentRes = await comment.save()
        res.status(200).json({
            commentBy: commentRes.commentBy,
            videoId: commentRes.videoId,
            commentText: commentRes.commentText,
            dislikeStatus: commentDislikeStatus,
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

// =============Delete Comment by comment owner or video owner===============
const deleteComment = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        const video = await Video.findById(comment.videoId)

        if (comment.commentBy.toString() !== tokenData._id && video.uploadedBy.toString() !== tokenData._id) {
            return res.status(403).json({
                message: "You are not authorized to delete this comment"
            })
        }
        await Comment.deleteOne({ _id: comment._id })
        res.status(200).json({
            message: "delete successfully"
        })
        // else {
        //     const data = await Comment.findByIdAndDelete(req.params.commentId)
        //     return res.status(200).json({
        //         message: "Comment deleted successfully"
        //     })
        // }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = {
    addCommentbyId,
    editComment,
    getAllComment,
    commentLikeUnlike,
    commentDislikeUndislike,
    deleteComment
}