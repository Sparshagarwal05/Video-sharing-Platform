import mongoose from "mongoose"
import { ApiError } from "../utils/apiError.js"
import { Subscription } from "../models/subscription.model.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // -> Find the user in the subscribers list of channel
    // -> If found, delete that subscription doc and update the subscribers list using reacct
    // -> If not found, create a subscription doc and update the subscribers list using react

    const channel = await User.findById(new mongoose.Types.ObjectId(channelId))
    const toggle = channel.isSubscribed

    if (toggle) {
        await Subscription.findOneAndDelete(
            {
                subscriber: new mongoose.Types.ObjectId(req.user?._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        )
    } else {
        const subscription = await Subscription.create(
            {
                subscriber: new mongoose.Types.ObjectId(req.user?._id),
                channel: new mongoose.Types.ObjectId(channelId)
            }
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Toggle successful"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const channelSubscribers = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "subscriber",
                            foreignField: "_id",
                            as: "subscriberID",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            subscriberID: {
                                $first: "$subscriberID"
                            }
                        }
                    }
                ]
            }
        },
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, channelSubscribers[0].subscribers, "Subscribers list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required")
    }

    const channelSubscribedTo = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "channel",
                            foreignField: "_id",
                            as: "subscribedToID",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            subscribedToID: {
                                $first: "$subscribedToID"
                            }
                        }
                    }
                ]
            }
        },
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, channelSubscribedTo[0].subscribedTo, "Channel list fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}