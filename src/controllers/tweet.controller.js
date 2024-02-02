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

  const createdTweet = await newTweet.findById(newTweet._id);
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

  const tweetExist = await Tweet.findById(tweetId);
  if (!tweetExist) {
    throw new ApiError(403, "invalid tweet id , tweet not exist");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetExist._id,
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
  if (!tweetId) {
    throw new ApiError(404, "tweet  id ??? ");
  }

  const tweetExist = await Tweet.findById(tweetId);
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

  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new ApiError(404, "user is not exist ?? ");
  }

  const tweets = await Tweet.find({ owner: userExist._id });
  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "all tweets according user id"));
});

export { addtweet, updateTweet, deleteTweet, getUserTweets };
