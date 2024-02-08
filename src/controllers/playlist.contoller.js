import { asyncHandler } from "../utils/asyncHandler";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
});

const getPlaylistId = asyncHandler(async (req, res) => {
  const { palylistId } = req.params;
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { palylistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
});
