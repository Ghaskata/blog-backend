import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Comment } from "../models/comment.model.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "video is not found");
  }
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(404, "video is not found");
  }

  const likeExist = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { video: videoObjectId }],
  });
  console.log("liked >>> ", likeExist);
  let likedStatus;
  if (!likeExist) {
    likedStatus = await Like.create({
      video: videoObjectId,
      likedBy: req.user?._id,
    });
  } else {
    likedStatus = await Like.findByIdAndDelete(likeExist._id);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedStatus,
        `video like status : ${!likeExist ? "video Liked" : "video UnLiked"}`
      )
    );
});
export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "comment is not found");
  }
  const commentObjectId = new mongoose.Types.ObjectId(commentId);
  const commentExist = await Comment.findById(commentObjectId);
  if (!commentExist) {
    throw new ApiError(404, "comment is not found");
  }

  const likeExist = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { comment: commentObjectId }],
  });
  console.log("liked >>> ", likeExist);
  let likedStatus;
  if (!likeExist) {
    likedStatus = await Like.create({
      comment: commentObjectId,
      likedBy: req.user?._id,
    });
  } else {
    likedStatus = await Like.findByIdAndDelete(likeExist._id);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedStatus,
        `comment like status : ${
          !likeExist ? "comment Liked" : "comment UnLiked"
        }`
      )
    );
});
export const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(404, "tweet is not found");
  }
  const tweetObjectId = new mongoose.Types.ObjectId(tweetId);
  const tweetExist = await Tweet.findById(tweetObjectId);
  if (!tweetExist) {
    throw new ApiError(404, "tweet is not found");
  }

  const likeExist = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { tweet: tweetObjectId }],
  });
  console.log("liked >>> ", likeExist);
  let likedStatus;
  if (!likeExist) {
    likedStatus = await Like.create({
      tweet: tweetObjectId,
      likedBy: req.user?._id,
    });
  } else {
    likedStatus = await Like.findByIdAndDelete(likeExist._id);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedStatus,
        `tweet like status : ${!likeExist ? "tweet Liked" : "tweet UnLiked"}`
      )
    );
});
export const getLikedVideo = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user?._id,
    video: { $exists: true },
  }).populate("video");

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "all the liked video by user"));
});
