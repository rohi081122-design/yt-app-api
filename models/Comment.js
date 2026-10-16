const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        commentText: {
            type: String,
            required: true, 
            trim: true
        },

        //Check code
        commentBy: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: 'User'
        },

        videoid:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
       
        commentLike: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        commentDislike: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]

        // subscriberid: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "User",
        //         required: true
        //     }
        // ],


    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Comment', commentSchema);