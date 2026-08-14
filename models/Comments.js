const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {

        commentText: {
            type: String,
            required: true, 
            trim: true
        },

        videoid: 
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
                required: true
            },

        subscriberid: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        // commentlikeUsers: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User"
        // }],

        // commentdislikeUsers: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User"
        // }]

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Comment', commentSchema);