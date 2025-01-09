import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $unwind: "$comments",
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.owner",
        foreignField: "_id",
        as: "comments.owner",
      },
    },
    {
      $unwind: "$comments.owner",
    },
    {
      $project: {
        _id: "$comments._id",
        content: "$comments.content",
        owner: {
          _id: "$comments.owner._id",
          username: "$comments.owner.username",
        },
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: Number(page) } }],
        comments: [{ $skip: (page - 1) * limit }, { $limit: Number(limit) }],
      },
    },
  ]);

  console.log(video);

  return res
    .status(200)
    .json(new ApiResponse(200, "Comments retrieved", video));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const comment = new Comment({
    content,
    video: videoId,
    owner: req.user.id,
  });

  await comment.save();

  res.status(201).json(new ApiResponse(201, "Comment added", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, "Comment updated", comment));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  return res.status(200).json(new ApiResponse(200, "Comment deleted", comment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
