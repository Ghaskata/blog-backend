import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || !content || content.trim() === "") {
    throw new ApiError(404, "video id ??? or content  missing???");
  }

  const videoExist = await Video.findById(videoId);
  if (!videoExist) {
    throw new ApiError(403, "invalid vedio id vedio not exist");
  }

  const newComment = await Comment.create({
    content: content,
    video: videoExist._id,
    owner: req.user._id,
  });
  const createdComment = await newComment.findById(newComment._id);
  if (!createdComment) {
    throw new ApiError(500, "somthing gets wrong white creating comment");
  }
  console.log("created comment >>>", createdComment);
  return res
    .status(200)
    .json(new ApiResponse(200, createdComment, "commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !content || content.trim() === "") {
    throw new ApiError(404, "comment id or content  missing ???");
  }

  const commentExist = await Comment.findById(commentId);
  if (!commentExist) {
    throw new ApiError(403, "invalid comment id , comment not exist");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentExist._id },
    { $set: { content: content } }
  );
  if (!updateComment) {
    throw new ApiError(500, "somthing gets wrong white updateing comment");
  }
  console.log("updated comment >>>", updateComment);
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdComment, "commente updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "comment  id ??? ");
  }

  const commentExist = await Comment.findById(commentId);
  if (!commentExist) {
    throw new ApiError(403, "comment not exist");
  }

  const deletedComment = await Comment.deleteOne({ _id: commentExist._id });
  console.log("deleted comment >>>", deletedComment);
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedComment, "commente deleted successfully")
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(404, "video id not ??? ");
  }

  const videoExist = await Video.findById(videoId);
  if (!videoExist) {
    throw new ApiError(403, "invalid vedio id vedio not exist");
  }

  const { page = 1, limit = 10 } = req.query;
  //   const comments = await Video.aggregate([
  //     {
  //       $match: (_id = mongoose.Types.ObjectId(videoId)),
  //     },
  //     {
  //       $lookup: {
  //         from: "Comment",
  //         localField: "_id",
  //         foreignField: "video",
  //         as: "comment",
  //       },
  //     },
  //     {
  //       $addFields: {
  //         $first: "$comment",
  //       },
  //     },
  //   ]);

  const comments = await Comment.find({
    videoId: mongoose.Types.ObjectId(videoId),
  });

  console.log("get all comments >>> ", comments);
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "get Allcomments"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
