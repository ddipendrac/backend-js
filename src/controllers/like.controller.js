import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js" 
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid");
    }

    const existingLike = await Like.findOne({ user: userId, video: videoId })

    if (existingLike) {
        await existingLike.deleteOne();
        return res
        .status(200)
        .json(new ApiResponse(200, null, "Like removed successfully"))
    }

    const newLike = await Like.create({ user: userId, video: videoId});

    return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid coment id")
    }

    const existingCommentLike = await Like.findOne({ user: userId, comment: commentId})

    if(existingCommentLike) {
        await existingCommentLike.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200, "Comment like removed successfully"))
    }

    const newLike = await Like.create({user: userId, coment: commentId});
    return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Comment liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id invalid")
    }

    const existingLike = await Like.findOne({user: userId, tweet: tweetId})

    if (existingLike) {
        await existingLike.deleteOne()

        return res
        .status(200)
        .json(new ApiResponse(200, "Tweet like removed"))
    }

    const newLike = await Like.create({user: userId, tweet: tweetId})

    return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Tweet liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;

    const likedVideos = await Like.find({user: userId, video: {$exists: true}})
        .populate("video")
        .sort({ createdAt: -1 });

       return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully")); 
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}