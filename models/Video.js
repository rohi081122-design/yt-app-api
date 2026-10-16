const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        tags: [ 
            {
                type: String
            }
        ],

        category: [{
            type: String,
            enum: ["Comedy", "Education", "Gaming", "Technology", "Fashion", "Food", "Other"]
        }],

        videoUrl: {
            type: String,
            required: true
        },

        videoPublicId: {
            type: String,
            required: true
        },

        thumbnailUrl: {
            type: String,
            default: ""
        },

        thumbnailPublicId: {
            type: String,
            default: ""
        },

        views: {
            type: Number,
            default: 0
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        likeUser: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        dislikeUser: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        comment: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment'
            }
        ]

    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Video", videoSchema);