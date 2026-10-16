require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary').v2
const User = require('../models/User')

// const cloudinary = require('../config/cloudinary') 



//Singup
const signup = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email })

        if (user.length > 0) {
            return res.status(500).json({ message: "Email already registered" })
        }

        if (req.body.password.length < 8) {
            return res.status(500).json({ message: "Password must be at least 8 characters" })
        }

        const hash = await bcrypt.hash(req.body.password, 10)
        console.log(hash);


        const newUser = await new User({

            email: req.body.email,
            channelName: req.body.channelName,
            password: hash,
            description: req.body.description

        })

        const data = await newUser.save()
        res.status(200).json({
            data,
            message: "Signup successfully"
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'registeration failed',
            error: err.message
        })
    }
};



//Login 
const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res.status(500).json({ message: "Email not registerd" })

        }
        console.log(user);

        const isMatch = await bcrypt.compare(req.body.password, user.password)
        console.log(user.password);

        console.log(isMatch);

        if (!isMatch) {
            return res.status(500).json({ message: "password not matched" })
        }
        const token = jwt.sign({
            _id: user._id,
            channelName: user.channelName,
            email: user.email
        },
            process.env.SEC_KEY,
            {
                "expiresIn": '7d'
            })

        res.status(200).json({ token: token, data: user, message: "Login Successfully" })
    }
    catch (err) {
        console.log(err);

        res.status(500).json({
            msg: 'Logined failed',
            error: err.message
        })
    }
}

//Subscribe
const subscribe = async (req, res) => {
    try {
        const channelId = req.params.channelId;
        const token = req.headers.authorization.split(" ")[1]

        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        if (tokenData._id == channelId) {
            return res.status(500).json({ message: 'You cannot subsribe yourself' })
        }
        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(404).json({
                message: "Channel not found"
            });
        }
        if (channel.subscriber.map(id => (id.toString())).includes(tokenData._id)) {
            return res.status(500).json({ message: "already subscribed" })
        }
        channel.subscriber.push(tokenData._id);
        await channel.save();

        const user = await User.findById(tokenData._id)
        user.subscribedTo.push(channel._id)
        await user.save()
        console.log(user);

        console.log("subscirbe successfully");

        res.status(200).json({ message: "subscirbe successfully", user })




    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 
            msg: 'Subscribed failed',  
            error: err.message
         })


    }

}

//Unsubscribe
const unsubscribe = async (req, res) => {

    try {
        const channelId = req.params.channelId;
        const token = req.headers.authorization.split(" ")[1]

        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(404).json({
                message: "Channel not found"
            });
        }
        if (!channel.subscriber.map(id => (id.toString())).includes(tokenData._id)) {
            return res.status(500).json({ message: "You are not subscribe this channel" })
        }
        channel.subscriber = channel.subscriber.filter((userId) => {
            userId != tokenData._id
        });


        await channel.save();

        const user = await User.findById(tokenData._id)
        user.subscribedTo = channel.subscribedTo.filter((userId) => {
            userId != channelId
        });

        console.log("unsubscirbe successfully");
        res.status(200).json({ message: "unsubscirbe successfully" })


        await user.save()
        console.log(user);


    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'Unsubscribed failed',
            error: err.message
        })


    }

}


//Upload Profile Image
const uploadProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        
        const user = await User.findById(tokenData._id)

        console.log(user);

        if (!req.files || !req.files.profileImage) {
            return res.status(400).json({
                message: "Profile Image Required"
            })
        }
        if (user.profilePicId) {
            await cloudinary.uploader.destroy(user.profilePicId);
        }
        const uploadImage = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath, {
            folder: "Youtube/userProfile"
        });
        user.profilePicUrl = uploadImage.secure_url
        user.profilePicId = uploadImage.public_id

        const data = await user.save()

        res.status(200).json({
            message: "Profile image uploaded Successfully",
            data
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'something wrong',
            error: err.message
        })

    }
}


//Uopload Cover Image
const uploadCoverProfilePic = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const user = await User.findById(tokenData._id)

        console.log(user);

        if (!req.files || !req.files.coverImage) {
            return res.status(500).json({ message: "Cover Image Required" })
        }

        if (user.coverPicId) {

            await cloudinary.uploader.delete(user.coverPicId)
        }
        const uploadImage = await cloudinary.uploader.upload(req.files.coverImage.tempFilePath, {
            folder: "Youtube/coverImage"
        });
        user.coverPicUrl = uploadImage.secure_url
        user.coverPicId = uploadImage.public_id
        const data = await user.save()
        res.status(200).json({
            message: "Cover image uploaded Successfully",
            data
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'something wrong',
            error: err.message
        })

    }
}

//Get Channel Info
const getChannelInfo = async (req, res) => {
    try {
        const channelId = req.params.channelId
        const channel = await User.findById(channelId)
        if (!channel) {
            return res.status(500).json({
                message: "Channel not found"
            })
        }
        res.status(200).json({
            channelName: channel.channelName,
            email: channel.email,
            profilePicUrl: channel.profilePicUrl,
            profilePicId: channel.profilePicId,
            coverPicUrl: channel.coverPicUrl,
            coverPicId: channel.coverPicId,
            description: channel.description,
            subscriber: channel.subscriber.length

        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 
            msg: 'something wrong',  
            error: err.message
         })

    }

}

//Get User Info 
const getUserInfo = async (req, res) => {
    try {
        const userId = req.params.userId
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const user = await User.findById(tokenData._id).populate("subscribedTo", "-password -subscribedTo")
        if (!user) {
            return res.status(500).json({
                message: "User not found"
            })
        }
        console.log(user)

        const userInfo = {
            channelName: user.channelName,
            email: user.email,
            profilePicUrl: user.profilePicUrl,
            profilePicId: user.profilePicId,
            coverPicUrl: user.coverPicUrl,
            coverPicId: user.coverPicId,
            description: user.description,
            subscriber: user.subscriber.length,
            subscribedTo: user.subscribedTo
        }

        const info = []
        userInfo.subscribedTo.forEach(d => {
            const subscriberCount = d.subscriber.length
            const data = {
                id: d._id,
                channelName: d.channelName,
                subscribers: subscriberCount
            }
            info.push(data)
        })
        userInfo.subscribedTo = info
        res.status(200).json({
            userInfo
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            msg: 'something wrong',
            error: err.message
        })

    }

}

//update channel detail 
const updateChannelDetail = async (req, res) => {
    try {

        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)
        const channel = await User.findById(req.params.channelId)
        if (req.params.channelId !== tokenData._id) {
            return res.status(500).json({
                message: "you are not allowed"
            })
        }

        if (req.body.password) {
            const isMatch = await bcrypt.compare(req.body.oldPassword, channel.password)
            if (isMatch) {
                const hash = await bcrypt.hash(req.body.password, 10)
                channel.password = hash
            }
            else {
                return res.status(500).json({
                    error: "Old password mismatch"
                })
            }
        }
        channel.channelName = req.body.channelName
        channel.description = req.body.description

        await channel.save()
        res.status(200).json({ channel })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 
            msg: 'something wrong',  
            error: err.message
         })

    }
}

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SEC_KEY)

        await User.deleteOne({ _id: tokenData._id })
        res.status(200).json({
            message: "logout successfully"
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ 
            msg: 'something wrong',  
            error: err.message
         })

    }
}

module.exports = {
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
} 