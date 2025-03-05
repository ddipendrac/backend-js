import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {  page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    
    // Implement pagination (page, limit).
    // Implement filtering (query, userId).
    // Implement sorting (sortBy, sortType).

    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" }; // Case-insensitive search
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully", { total: totalVideos }));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoFile = req.file;

    if (!videoFile) {
        throw new ApiError(400, "Video file is required");
    }

    const videoUploadResult = await uploadOnCloudinary(videoFile.path, "video");

    if (!videoUploadResult || !videoUploadResult.secure_url) {
        throw new ApiError(500, "Video upload failed");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoUrl: videoUploadResult.secure_url,
        owner: req.user?._id,
    });

    res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true, runValidators: true }
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found");
    }

    res
        .status(200)
        .json(new ApiResponse(200, null, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res
    .status(200)
    .json(new ApiResponse(200, video, "Video publish status updated"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
