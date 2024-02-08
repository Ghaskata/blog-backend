import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(404, "all fields are requre");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  const createdPlaylist = await Playlist.findById(playlist._id);
  return res
    .status(200)
    .json(new ApiResponse(200, createdPlaylist, "playlist created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "user id not found");
  }
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const userExist = await User.findById(userObjectId);
  if (!userExist) {
    throw new ApiError(404, "user nkot exist");
  }

  const allUserPlaylists = await Playlist.find({
    owner: userObjectId,
  }).populate("owner");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allUserPlaylists,
        `no of playlists of user ${allUserPlaylists.length}`
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlist id not found");
  }
  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);
  const playlistExist =
    await Playlist.findById(playlistObjectId).populate("videos");
  console.log("palylist .>> ", playlistExist);
  if (!playlistExist) {
    throw new ApiError(404, "play list not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlistExist, "playlist found "));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(
      "404",
      "playlistId, videoId not found ../:playlistId/:videoId "
    );
  }

  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const playlistExist = await Playlist.findById(playlistObjectId);
  const videoExist = await Video.findById(videoObjectId);
  if (!playlistExist) {
    throw new ApiError(404, "playlist not exist");
  }
  if (!videoExist) {
    throw new ApiError(404, "videoObjectId not exist");
  }

  const alredyAddedInPlaylist = playlistExist.videos.includes(videoObjectId);

  if (alredyAddedInPlaylist) {
    throw new ApiError(403, "vidseo alredy present in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistObjectId,
    {
      $push: {
        videos: videoObjectId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "error while add video updating playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "playlist video add and updated succesfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(
      "404",
      "playlistId, videoId not found ../:playlistId/:videoId "
    );
  }

  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const playlistExist = await Playlist.findById(playlistObjectId);
  const videoExist = await Video.findById(videoObjectId);
  if (!playlistExist) {
    throw new ApiError(404, "playlist not exist");
  }
  if (!videoExist) {
    throw new ApiError(404, "videoObjectId not exist");
  }

  const alredyAddedInPlaylist = playlistExist.videos.includes(videoObjectId);

  if (!alredyAddedInPlaylist) {
    throw new ApiError(403, "video not present in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistObjectId,
    {
      $pull: {
        videos: videoObjectId,
      },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "error while remove video updating playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "playlist video removed and updated succesfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlist id not found");
  }
  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);
  const playlistExists = await Playlist.findById(playlistObjectId);
  if (!playlistExists) {
    throw new ApiError(404, "playlist not exist");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistObjectId);
  if (!deletedPlaylist) {
    throw new ApiError(500, "error while deleting playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "playlist deleted succesfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(404, "playlist id not found");
  }
  if (!name || !description) {
    throw new ApiError(404, "all fileds are require");
  }

  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);
  const playlistExist = await Playlist.findById(playlistObjectId);
  if (!playlistExist) {
    throw new ApiError(404, "playlist not exist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistObjectId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "server error");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "playlist update succesfully"));
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
