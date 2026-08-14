const cloudinary = require('../configure/cloudinary')
const jwt = require('jsonwebtoken')
const Video = require('../models/Video')

const upload = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        console.log(req.files)
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type:'video',
            folder:'sbstube/video'
        })

        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath,{
            resource_type:'image',
            folder:'sbstube/thumbnail'
        })

        const newVideo = new Video({
            title:req.body.title,
            description:req.body.description,
            videoUrl:uploadedVideo.secure_url,
            videoPublicId:uploadedVideo.public_id,
            thumbnailUrl:uploadedThumbnail.secure_url,
            thumbnailPublicId:uploadedThumbnail.public_id,
            uploadedBy:tokenData._id
        })

        const newUploadedVideo = await newVideo.save()
        res.status(200).json({
            newVideo:newUploadedVideo
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}

module.exports = {upload}