import mongoose from "mongoose"
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { Playlist } from "../models/playlist.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if (!name) {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create(
        {
            name: name,
            description: description || "",
            owner: new mongoose.Types.ObjectId(req.user?._id)
        }
    )

    if (!playlist) {
        throw new ApiError(500, "ISE, Playlist not created")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(400, "UserID is required")
    }

    const userPlaylists = await Playlist.find({
        owner: new mongoose.Types.ObjectId(userId)
    })

    if (!userPlaylists) {
        throw new ApiError(500, "ISE, playlists could not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, userPlaylists, "Playlists fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "PlaylistID is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "ISE, playlist could not be fetched")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistID and VideoID is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "ISE, playlist not found")
    }

    playlist.videos.push(videoId)
    const updatedPlaylist = await playlist.save({validateBeforeSave: false, new:true})

    if (!updatedPlaylist) {
        throw new ApiError(500, "ISE, video added to playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistID and VideoID is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(500, "ISE, playlist not found")
    }

    playlist.videos = playlist.videos.filter((video) => video !== videoId)
    const updatedPlaylist = await playlist.save({validateBeforeSave: false, new:true})

    if (!updatedPlaylist) {
        throw new ApiError(500, "ISE, video cannot be removed from playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed to playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(400, "PlaylistID is required")
    }

    await Playlist.findByIdAndDelete(playlistId)

    const playlist = await Playlist.findById(playlistId)
    if (playlist) {
        throw new ApiError(500, "ISE, Playist not deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId) {
        throw new ApiError(400, "PlaylistID is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(500, "ISE, playlist not found")
    }

    if (name.trim() !== "") {
        playlist.name = name
    }

    if (description) {
        playlist.description = description
    }

    const updatedPlaylist = await playlist.save({validateBeforeSave: false, new:true})
    if (!updatedPlaylist) {
        throw new ApiError(500, "ISE, playlist cannot be updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}