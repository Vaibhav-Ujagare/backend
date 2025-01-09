import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const userId = req.user?._id;

  const getLikedVideo = await Like.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (getLikedVideo.length > 0) {
    await Like.deleteMany({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: new mongoose.Types.ObjectId(userId),
    });
  } else {
    const like = new Like({
      video: videoId,
      likedBy: userId,
    });

    await like.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${getLikedVideo.length > 0 ? "Disliked" : "Liked"}`,
        {}
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const userId = req.user?._id;

  const getLikedComment = await Like.aggregate([
    {
      $match: {
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (getLikedComment.length > 0) {
    await Like.deleteMany({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: new mongoose.Types.ObjectId(userId),
    });
  } else {
    const like = new Like({
      comment: commentId,
      likedBy: userId,
    });

    await like.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${getLikedComment.length > 0 ? "Disliked" : "Liked"}`,
        {}
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const userId = req.user?._id;

  const getLikedTweet = await Like.aggregate([
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (getLikedTweet.length > 0) {
    await Like.deleteMany({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: new mongoose.Types.ObjectId(userId),
    });
  } else {
    const like = new Like({
      tweet: tweetId,
      likedBy: userId,
    });

    await like.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `${getLikedTweet.length > 0 ? "Disliked" : "Liked"}`,
        {}
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const getLikedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate("video");

  return res
    .status(200)
    .json(new ApiResponse(200, "Liked videos", getLikedVideos));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
