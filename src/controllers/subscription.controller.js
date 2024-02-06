import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(404, "channel id is missing");
  }

  const channelObjectId = new mongoose.Types.ObjectId(channelId);
  const channelExist = await User.findById(channelObjectId);
  if (!channelExist) {
    throw new ApiError(404, "hannel not exist");
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelExist._id,
  }).populate("channel");

  if (isSubscribed) {
    const removeSubscription = await Subscription.findByIdAndDelete(
      isSubscribed._id
    ).populate("channel");
    return res
      .status(200)
      .json(
        new ApiResponse(200, removeSubscription, "channal subscription removed")
      );
  } else {
    const subscription = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelObjectId,
    });
    const addedSubscription = await Subscription.findById(
      subscription._id
    ).populate("channel");
    return res
      .status(200)
      .json(
        new ApiResponse(200, addedSubscription, "channal subscription added")
      );
  }
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});
