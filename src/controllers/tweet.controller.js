import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet 
    const {content} = req.body; 
    const userId = req.user?._id;

    if(!content || content.length > 280){
        throw new ApiError(400, "Tweet is required and must be under 280 characters")
    }

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }

    const tweet = await Tweet.create({ 
        content,
        user: userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const tweets = await Tweet.find({ user: userId }).sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const {content} = req.body;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "User id is invalid")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(400, "Tweet not found")
    }

    tweet.content = content || tweet.content;
    await tweet.save();

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    const userId = req.user?._id;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError("Tweet not found")
    }

    if (tweet.user.toString() !== userId.toString()) {
        throw new ApiError("Unauthorized to delete this tweet");
    }

    await tweet.deleteOne();

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
