import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = new Playlist({
    name: name,
    description: description,
    owner: req.user._id,
  });

  await playlist.save();

  res.status(201).json(new ApiResponse(201, "Playlist created", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, "User playlists", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(new ApiResponse(200, "Playlist found", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  //if owner is present in the playlist, then update the record else create new record

  const owner = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $project: {
        owner: 1,
      },
    },
  ]);

  if (owner.length > 0) {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: {
            _id: videoId,
          },
        },
        owner: req.user._id,
      },
      { new: true }
    );
  } else {
    const playlist = new Playlist({
      name: name,
      description: description,
      owner: req.user._id,
      videos: [
        {
          _id: videoId,
        },
      ],
    });

    await playlist.save();
  }

  res.status(200).json(new ApiResponse(200, "Video added to playlist", {}));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  const playlist = await Playlist.findByIdAndDelete(
    playlistId,
    {
      $pull: {
        videos: {
          _id: videoId,
        },
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(new ApiResponse(200, "Video removed from playlist", {}));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId)) { 
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(new ApiResponse(200, "Playlist deleted", {}));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name: name,
      description: description,
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res.status(200).json(new ApiResponse(200, "Playlist updated", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
