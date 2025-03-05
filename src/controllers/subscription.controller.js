import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
// Validate if channelId is valid.
// Ensure the channel (user) exists.
// Check if the subscription already exists; if yes, remove it (unsubscribe); otherwise, add it (subscribe).
// Return an appropriate response.

    const userId = req.user?._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (userId === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
    });

    if (existingSubscription) {
        // Unsubscribe (remove from DB)
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    } else {
        // Subscribe (add to DB)
        await Subscription.create({ channel: channelId, subscriber: userId });
        return res.status(201).json(new ApiResponse(201, {}, "Subscribed successfully"));
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name email avatar") // Populate subscriber details
        .exec();
        // populate("subscriber") replaces the subscriber field in the Subscription documents with the actual referenced user document.
        //.exec() : Executes the query and returns a promise that resolves with the found subscriptions.

    return res.status(200).json(new ApiResponse(200, { subscribers }, "Subscribers fetched successfully"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name email avatar") // Populate channel details
        .exec();

    return res
        .status(200)
        .json(new ApiResponse(200, { subscriptions }, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}