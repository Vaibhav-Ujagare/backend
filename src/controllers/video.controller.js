import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  return res
    .status(200)
    .json(new ApiResponse(201, { videos: [] }, "Videos fetched successfully!"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const userId = req.user._id;
  const { title, description } = req.body;

  if (!userId) {
    throw new ApiError(400, "Login required");
  }

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalFilePath = req.files?.videoFile[0];

  if (!videoLocalFilePath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalFilePath.path, "video");

  const thumbnailLocalFilePath = req.files?.thumbnail[0];
  if (!thumbnailLocalFilePath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const thumbnail = await uploadOnCloudinary(
    thumbnailLocalFilePath.path,
    "image"
  );

  const video = new Video({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    user: req.user._id,
    duration: videoFile.duration,
    owner: userId,
  });
  console.log(video);

  await video.save();

  return res
    .status(201)
    .json(new ApiResponse(201, { video }, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId)
    .populate({
      path: "owner",
      select: "-password",
    })
    .exec();
  console.log(video);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", { video }));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description, thumbnail } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, `Invalid video id${videoId}`);
  }

  const thumbnailLocalFilePath = req.file?.path;

  console.log("ThumbnailLocalPath", thumbnailLocalFilePath);

  if (!thumbnailLocalFilePath) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const updatedThumbnail = await uploadOnCloudinary(
    thumbnailLocalFilePath,
    "image"
  );

  console.log("Updated thumbnail path", updatedThumbnail.url);
  console.log("Title: ", title);
  console.log("Description: ", description);

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: updatedThumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, `Invalid video id`);
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const publishStatus = await Video.findById(videoId);

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !publishStatus.isPublished,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video publish status updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
