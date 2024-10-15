import mongoose, {isValidObjectId} from 'mongoose'
import { ApiError } from '../utils/apiError.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { Video } from '../models/video.model.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js'

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    let matchCondition = null

    const options = {
        page: page,
        limit: limit,
        sortBy: sortBy || 'createdAt',
        sortBy: sortType || 'asc'
    }

    if (query) {
        matchCondition = {
            $or: [
                { title: { $regex: query, $options: "i"}},
                { description: { $regex: query, $options: "i"}}
            ]
        }
    }

    
    const videos = await Video.aggregatePaginate(
        [
            {
                $match: matchCondition
            }
        ],
        options
    ).then((result) => {
        console.log(result);
        return result
    }).catch((error) => {
        throw new ApiError(500, `Internal server error !! : ${error}`)
    })

    return res
    .status(200)
    .json(new ApiResponse(200, videos.docs, "Videos fetched successfully" ))
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(400, "Both title and description are required")
    }

    const videoFilePath = req.files?.videoFile[0].path
    const thumbnailPath = req.files?.thumbnail[0].path
    
    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video file and thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    console.log(videoFile);
    console.log(thumbnail);

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!video) {
        throw new ApiError(500, "Internal server error while publishing the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId.isValidObjectId()) {
        throw new ApiError(400, "Video Id not valid")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(500, "ISE, could not find user")
    }

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))
    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    //updating user watch history

    user.watchHistory = user.watchHistory.unshift(videoId)
    await user.save({validateBeforeSave: false, new: true})

    //updating video views

    video.views += 1
    video.save({validateBeforeSave: false, new: true})
    

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body
    let thumbnailLocalPath
    if(req.file)
    {
        thumbnailLocalPath = req.file.path
    }
    console.log(req.file);

    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    const video = await Video.find({
        _id: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    if (title) {
        video.title = title
    }

    if (description) {
        video.description = description
    }

    if (thumbnailLocalPath) {
        await deleteFromCloudinary(video.thumbnail)
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnail) {
            throw new ApiError(500, "Internal server error while updating thumbnail")
        }

        video.thumbnail = thumbnail.url
    }
    video.save({validateBeforeSave: false, new: true})

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    const video = await Video.find({
        _id: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    // console.log(video);
    // console.log(video.videoFile);
    await deleteFromCloudinary(video.videoFile)

    await Video.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    const video = await Video.find({
        _id: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    video.isPublished = !video.isPublished
    video.save({validateBeforeSave: false, new: true})

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Toggle status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}