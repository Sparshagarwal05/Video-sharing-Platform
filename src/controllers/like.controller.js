import mongoose from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "VideoID is required")
    }

    const toggleLike = await Like.find({
        video: new mongoose.Types.ObjectId(videoId)
    })

    let like
    if (!toggleLike) {
        like = await Like.create({
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    } else {
        await Like.findOneAndDelete({
            video: new mongoose.Types.ObjectId(videoId)
        })
    }

    return res
    .status(200)
    .json(new ApiResponse(200, like._id, "Video Like toggled successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "CommentID is required")
    }

    const toggleLike = await Like.find({
        comment: new mongoose.Types.ObjectId(commentId)
    })

    let like
    if (!toggleLike) {
        like = await Like.create({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    } else {
        await Like.findOneAndDelete({
            comment: new mongoose.Types.ObjectId(commentId)
        })
    }

    return res
    .status(200)
    .json(new ApiResponse(200, like._id, "Comment Like toggled successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(400, "TweetID is required")
    }

    const toggleLike = await Like.find({
        tweet: new mongoose.Types.ObjectId(tweetId)
    })

    let like
    if (!toggleLike) {
        like = await Like.create({
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
        })
    } else {
        await Like.findOneAndDelete({
            tweet: new mongoose.Types.ObjectId(tweetId)
        })
    }

    return res
    .status(200)
    .json(new ApiResponse(200, like._id, "Tweet Like toggled successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likeBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $project: {
                video: 1
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(500, "Internal server error, liked videos not fetched.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}