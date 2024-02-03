import mongoose, { isValidObjectId } from "mongoose";
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

  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  if (!isValidObjectId(videoObjectId)) {
    throw new ApiError(400, "invalid video id");
  }

  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(403, "invalid vedio id vedio not exist");
  }

  const newComment = await Comment.create({
    content: content,
    video: videoObjectId,
    owner: req.user._id,
  });

  const createdComment = await Comment.findById(newComment._id);
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

  const commentObjectId = new mongoose.Types.ObjectId(commentId);
  if (!isValidObjectId(commentObjectId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const commentExist = await Comment.findById(commentObjectId);
  if (!commentExist) {
    throw new ApiError(403, "invalid comment id , comment not exist");
  }

  if (commentExist.owner !== req.user._id) {
    throw new ApiError(402, "comment not made by your you can't update it");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentObjectId,
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "somthing gets wrong white updateing comment");
  }
  console.log("updated comment >>>", updatedComment);
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "commente updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(404, "comment  id ??? ");
  }

  const commentObjectId = new mongoose.Types.ObjectId(commentId);

  if (!isValidObjectId(commentObjectId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const commentExist = await Comment.findById(commentObjectId);
  if (!commentExist) {
    throw new ApiError(403, "comment not exist");
  }

  if (commentExist.owner !== req.user._id) {
    throw new ApiError(402, "comment not made by your you can't delete it");
  }

  const deletedComment = await Comment.deleteOne({ _id: commentObjectId });
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

  const videoObjectId = new mongoose.Types.ObjectId(videoId);

  if (!isValidObjectId(videoObjectId)) {
    throw new ApiError(400, "invalid video id");
  }

  const videoExist = await Video.findById(videoObjectId);
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
    videoId: videoObjectId,
  });

  console.log("get all comments >>> ", comments);
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "get Allcomments"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
