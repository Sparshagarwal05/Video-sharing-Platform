import mongoose from "mongoose"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"




const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!videoId) {
        throw new ApiError(400, "VideoID is required")
    }

    const options = {
        page: page,
        limit: limit
    }

    const videoComments = await Comment.aggregatePaginate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ],
        options
    )

    if (!videoComments) {
        throw new ApiError(500, "Internal server error, video comments not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, videoComments, "Video comments fetched"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content } = req.body
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "VideoID is required")
    }

    if(content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.create({
        content: content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if (!comment) {
        throw new ApiError(500, "Internal server error, comment not added")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment._id, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { comment } = req.body
    const { commentId } = req.params

    if(!commentId || comment.trim() === "")
        {
            throw new ApiError(400, "Both comment and commentID is required")
        }
    
    const updatedComment = await Comment.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                content: comment
            }
        },
        {
            new: true
        }
    )

    if (!updateComment) {
        throw new ApiError(500, "Internal server error, comment not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params

    if(!commentId)
        {
            throw new ApiError(400, "CommentID is required")
        }

    await Comment.findByIdAndDelete(commentId)

    const comment = await Comment.findById(commentId)

    if (comment) {
        throw new ApiError(500, "Internal server error, comment not deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }