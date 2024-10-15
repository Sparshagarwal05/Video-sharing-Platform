import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"


const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.


    // Find user and add fields

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "videoLikes"
                        }
                    },
                    {
                        $addFields: {
                            likes: {
                                $size: "$videoLikes"
                            }
                        }
                    },
                    {
                        $project: {
                            views: 1,
                            likes: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },
        {
            $addFields: {
                totalTweets: {
                    $size: "$tweets"
                },
                totalSubscribers: {
                    $size: "$subscribers"
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                totalTweets: 1,
                totalSubscribers: 1,
                allVideos: 1
            }
        }
    ])

    if (!user) {
        throw new ApiError(500, "ISE, channel stats not updated")
    }

    console.log(user);
    let arr = user[0].allVideos
    let totalViews = 0
    let totalLikes = 0

    console.log(arr);
    arr.forEach(element => {
        totalViews += element.views
        totalLikes += element.likes
    });

    const data = {
        username: user[0].username,
        fullName: user[0].fullName,
        avatar: user[0].avatar,
        coverImage: user[0].coverImage,
        totalTweets: user[0].totalTweets,
        totalSubscribers: user[0].totalSubscribers,
        totalViews: totalViews,
        totalLikes: totalLikes
    }

    return res
    .status(200)
    .json(new ApiResponse(200, data, "Channel stats fetched"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const channelVideos = await Video.find({
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!channelVideos) {
        throw new ApiError(500, "ISE, Videos not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "Videos fetched"))
})

export {
    getChannelStats, 
    getChannelVideos
    }