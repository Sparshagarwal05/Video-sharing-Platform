import mongoose from "mongoose"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { Tweet } from "../models/tweet.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { tweet } = req.body

    if(!tweet || tweet.trim() === ""){
        throw new ApiError(400, "Tweet is required")
    }

    const tweetDoc = await Tweet.create(
        {
            content: tweet,
            owner: new mongoose.Types.ObjectId(req.user?._id)
        }
    )

    if (!tweetDoc) {
        throw new ApiError(500, "ISE, tweet not added")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweetDoc, "Tweet added"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "UserID is required")
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    if (!userTweets) {
        throw new ApiError(500, "ISE, User tweets not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { tweet } = req.body

    if (!tweetId || tweet.trim() === "") {
        throw new ApiError(400, "TweetID and tweet are required")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: tweet 
            }
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiResponse(500, "ISE, tweet not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet not updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "TweetID is required")
    }

    await Tweet.findByIdAndDelete(tweetId)

    const tweet = await Tweet.findById(tweetId)

    if (tweet) {
        throw new ApiError(500, "ISE, Tweet not deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}