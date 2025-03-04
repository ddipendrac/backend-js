import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Retrieves all comments for a given video, with pagination.
 */
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const comments = await Comment.find({ videoId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "fullName profilePic");

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

/**
 * Adds a new comment to a specific video.
 */
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.create({ userId, videoId, text });

    return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

/**
 * Updates an existing comment, ensuring that only the comment owner can modify it.
 */
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    let comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.userId.toString() !== userId) {
        throw new ApiError(403, "Unauthorized to update this comment");
    }

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text cannot be empty");
    }

    comment.text = text;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

/**
 * Deletes an existing comment, ensuring that only the comment owner can delete it.
 */
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    let comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.userId.toString() !== userId) {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
};
