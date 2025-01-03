import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Login required");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = new Tweet({ content, owner: userId });
  await tweet.save();

  return res.status(201).json(new ApiResponse(201, "Tweet created", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  console.log(userId);
  const allTweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        Tweets: {
          $size: "$owner",
        },
      },
    },
  ]);

  console.log(allTweets);
  return res.status(200).json(new ApiResponse(200, "User tweets", allTweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Login required");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content: content },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, "Tweet updated", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "Login required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res.status(200).json(new ApiResponse(200, "Tweet deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
