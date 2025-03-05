import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Fetch statistics
    const totalVideos = await Video.countDocuments({ owner: channelId });

    const [{ totalViews = 0 } = {}] = await Video.aggregate([
        { $match: { owner: new mongoose.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const [{ totalLikes = 0 } = {}] = await Like.aggregate([
        { $match: { videoOwner: new mongoose.ObjectId(channelId) } },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ]);

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    }, "Channel statistics fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
    
})

export {
    getChannelStats, 
    getChannelVideos
    }