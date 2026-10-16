const cloudinary = require('../configure/cloudinary') 
const jwt = require('jsonwebtoken');
const Video = require('../models/Video');

// const cloudinary = require('cloudinary').v2;


//========= Video Upload ================
const upload = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        console.log(req.files)

        // Video Check
        if (!req.files || !req.files.video) {
            return res.status(400).json({
                message: "Video required"
            })
        }

        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
            resource_type: 'video',
            folder: 'Youtude/video'
        })

        // Thumbnail Check
        if (!req.files || !req.files.thumbnail) {
            return res.status(400).json({
                message: "Thumbnail requird"
            })
        }

        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
            resource_type: 'image',
            folder: 'Youtube/thumbnail'
        });

        const newVideo = new Video({
            title: req.body.title,
            description: req.body.description,

            videoUrl: uploadedVideo.secure_url,
            videoPublicId: uploadedVideo.public_id,

            thumbnailUrl: uploadedThumbnail.secure_url,
            thumbnailPublicId: uploadedThumbnail.public_id,

            uploadedBy: tokenData._id,
            category: req.body.category,
            tags: req.body.tags
        })

        const newUploadedVideo = await newVideo.save()
        res.status(200).json({
            message: "Video Upload Successfully",
            newVideo: newUploadedVideo
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Video Upload Failed",
            error: err.message
        })
    }
}


//======== Get All Videos============
const getAllVideo = async (req, res) => {
    try {
        const data = await Video.find().populate('uploadedBy', 'channelName')
        console.log(data);
        return res.status(200).json({
            Video: data
        })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err.message
        })
    }
}

// =============Get Video by Id=============
const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('uploadedBy', 'channelName profilePicUrl subscriber');
        
        //Video Validation Check
        if(!video){
            return res.status(404).json({
                message: "Video not found"
            })
        }

        video.views += 1;

        var likeStatus = false;
        var dislikeStatus = false;
        var subscribeStatus = false;

        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];

            // console.log(token);

            if (token && token !== "null") {
                const tokenData = jwt.verify(token, process.env.SEC_KEY);
                // console.log(tokenData, token);

                const user = await User.findById(tokenData._id)

                if(user){
                    likeStatus = video.likeUser.includes(tokenData._id)
                    dislikeStatus = video.dislikeUser.includes(tokenData._id)
                    subscribeStatus = user.subscribedTo.includes(video.uploadedBy._id)
                }
            }
        }

        await video.save()

        const newRes = {
            title: video.title,
            description: video.description,
            tags: video.tags,
            category: video.category,
            videoUrl: video.videoUrl,
            videoPublicId: video.videoPublicId,
            thumbnailUrl: video.thumbnailUrl,
            thumbnailPublicId: video.thumbnailPublicId,
            views: video.views,
            likeCount: video.likeUser.length,
            dislikeCount: video.dislikeUser.length,
            uploadedBy: {
                _id: video.uploadedBy._id,
                channelName: video.uploadedBy.channelName,
                profilePicUrl: video.uploadedBy.profilePicUrl,
            },

            comment: video.comment,
            likeStatus: likeStatus,
            dislikeStatus: dislikeStatus,
            subscribeStatus: subscribeStatus
        };

        res.status(200).json({ 
            message: "Video fatched successfully",
            data: newRes 
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            message:"Failed to fetch video",
            error: err.message
        })
    }
}


// ===========Like/Unlike Video=================
const likeUnlike = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const userId = tokenData._id;

        console.log(req, params.videoId)
        const video = await Video.findById(req.params.videoId)

        console.log(video)
        //video status check krta hai
        if (!video) {
            return res.status(404).json({
                message: "Video not found"
            })
        }

        if (video.likeUser.includes(userId)) {
            video.likeUser = video.likeUser.filter(id => (id.toString() !== userId))

            const videoRes = await video.save();
            return res.status(200).json({
                video: videoRes.likeUser, isLike: false
            })
        }
        else {
            if (video.dislikeUser.includes(userId)) {
                video.dislikeUser = video.dislikeUser.filter(id => (id.toString() !== userId))
            }
            video.likeUser.push(userId);
            const videoRes = await video.save();
            return res.status(200).json({
                video: videoRes.likeUser, isLike: true
            })
        }

    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

// ======================Dislike/Undislike Video===========
const dislikeUndislike = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const userId = tokenData._id

        console.log(req.params.videoId)
        const video = await Video.findById(req.params.videoId)
        console.log(video)

        if (!video) {
            return res.status(404).json({
                message: "Video not found"
            })
        }

        if (video.dislikeUser.includes(userId)) {
            video.dislikeUser = video.dislikeUser.filter(id => (id.toString() !== userId))
            const videoRes = await video.save();
            res.status(200).json({
                video: videoRes.dislikeUser, isDislike: false
            })
        }
        else {
            if (video.likeUser.includes(userId)) {
                video.likeUser = video.likeUser.filter(id => (id.toString() !== userId))
            }
            video.dislikeUser.push(userId)
            const videoRes = await video.save();
            res.status(200).json({
                video: videoRes, isDislike: true
            })
        }
        // await video.save()
        // res.status(200).json({
        //     video: video
        // })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    }
}

// ============Updata Video Details by video owner=============
const updateVideoDetails = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const videoId = req.params.videoId
        const video = await Video.findById(videoId)

        //check video owner
        if (video.uploadedBy.toString() !== tokenData._id) {
            return res.status(500).json({
                message: "you are not allowed"
            })
        }

        //if tokenData._id is id of video owner
        video.title = req.body.title,
            video.description = req.body.description,
            video.tags = req.body.tags,
            video.category = req.body.category


        // const newVideoDetails = new Video({
        //     title: req.body.title || video.title,
        //     description: req.body.description || video.description
        // })
        // const updatedVideo = await Video.findByIdAndUpdate(videoId, newVideoDetails, { new: true })

        const updatedVideo = await video.save();
        res.status(200).json({
            video: updatedVideo
        })
    }
    catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}
// =========== Delete Video by Video Owner=====================
const deleteVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        const videoId = req.params.videoId
        const video = await Video.findById(videoId)

        //check video exist or not
        if (!video) {
            return res.staus(404).json({
                message: "Video not found"
            });
        }

        //check video owner
        if (video.uploadedBy.toString() !== tokenData._id) {
            return res.status(500).json({
                message: "you are not allowed"
            })
        }

        await cloudinary.uploader.destroy(video.videoPublicId, {
            resource_type: 'video'
        })
        await cloudinary.uploader.destroy(video.thumbnailPublicId, {
            resource_type: 'image'
        })

        await Video.deleteOne({ _id: video._id })
        // await Video.findByIdAndDelete(videoId)
        res.stat(200).json({
            message: "Video Deleted Successfully"
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

// All Video By Channel Id
const allVideoByChannelId = async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.params.channelId })
        console.log(videos);

        if (videos) {
            return res.status(200).json(videos)
        }
        return res.status(404).json({
            message: "video not found"
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 
            error: err.message
        })

    }
}

const getVideoByChannelId = async (req, res) => {
    try {

        const video = await Video.findOne({ uploadedBy: req.params.channelId }).select('thumbnailUrl title')
        video.views += 1;
        const videoRes = await video.save()
        res.status(200).json({ videoRes })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = {
    upload,
    getAllVideo,
    getVideoById,
    likeUnlike,
    dislikeUndislike,
    updateVideoDetails,
    deleteVideo,
    allVideoByChannelId,
    getVideoByChannelId
}