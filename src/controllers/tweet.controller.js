import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addtweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(404, "content  missing???");
  }

  const newTweet = await Tweet.create({
    content: content,
    owner: req.user._id,
  });

  const createdTweet = await Tweet.findById(newTweet._id);
  if (!createdTweet) {
    throw new ApiError(500, "somthing gets wrong white adding tweet");
  }
  console.log("add tweet >>>", createdTweet);
  return res
    .status(200)
    .json(new ApiResponse(200, createdTweet, "tweet add successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!tweetId || !content || content.trim() === "") {
    throw new ApiError(404, "tweetId or content  missing ???");
  }

  const tweetObjectId = new mongoose.Types.ObjectId(tweetId);
  if (!isValidObjectId(tweetObjectId)) {
    throw new ApiError(400, "invalid tweet id");
  }
  const tweetExist = await Tweet.findById(tweetObjectId);
  if (!tweetExist) {
    throw new ApiError(403, "invalid tweet id , tweet not exist");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetObjectId,
    {
      $set: { content: content },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "somthing gets wrong white updateing tweet");
  }
  console.log("updated tweet >>>", updatedTweet);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  console.log("params >>>> ", tweetId);
  if (!tweetId) {
    throw new ApiError(404, "tweet  id ??? ");
  }

  const tweetObjectId = new mongoose.Types.ObjectId(tweetId);
  const isValidObjectId = mongoose.isValidObjectId(tweetObjectId);

  if (!isValidObjectId) {
    throw new ApiError(400, "Invalid tweetId format");
  }

  const tweetExist = await Tweet.findById(tweetObjectId);
  if (!tweetExist) {
    throw new ApiError(403, "Tweet not exist");
  }

  const deletedTweet = await Tweet.deleteOne({ _id: tweetExist._id });
  console.log("deleted tweet >>>", deletedTweet);
  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "userid is missing ?? ");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (!isValidObjectId(userObjectId)) {
    throw new ApiError(400, "invalid user id");
  }
  const userExist = await User.findById(userObjectId);
  if (!userExist) {
    throw new ApiError(404, "user is not exist ?? ");
  }

  const tweets = await Tweet.find({ owner: userObjectId });
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "all tweets according user id"));
});

export { addtweet, updateTweet, deleteTweet, getUserTweets };
