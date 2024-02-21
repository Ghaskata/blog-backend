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
    throw new ApiError(404, "channel not exist");
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

// controller to return channel list to which user has subscribed        ex : get following
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(404, "channel id is missing");
  }

  const channelObjectId = new mongoose.Types.ObjectId(channelId);
  const channelExist = await User.findById(channelObjectId);
  if (!channelExist) {
    throw new ApiError(404, "channel not exist");
  }

  const AllSubscribers = await Subscription.find({
    channel: channelObjectId,
  })
    .populate("subscriber")
    .select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        AllSubscribers,
        `no of subscribers = ${AllSubscribers.length}`
      )
    );
});

// controller to return subscriber list of a channel       ex : get follower
export const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(404, "channel id is missing");
  }

  const subscriberObjectId = new mongoose.Types.ObjectId(subscriberId);
  const subscriberExist = await User.findById(subscriberObjectId);
  if (!subscriberExist) {
    throw new ApiError(404, "channel not exist");
  }

  const AllSubscribedChannels = await Subscription.find({
    subscriber: subscriberObjectId,
  }).populate("channel");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        AllSubscribedChannels,
        `no of subscribed channel/following = ${AllSubscribedChannels.length}`
      )
    );
});

export const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const userExist = await User.findById(userId);
  if (!userExist) {
    throw new ApiError(404, "user not found");
  }

  if (req.user._id === userObjectId) {
    return res
      .status(200)
      .json(new ApiResponse(200, { channelOwner: true }, "channel owner"));
  }

  const subscriptionRecord = await Subscription.findOne({
    $and: [{ channel: userObjectId }, { subscriber: req.user._id }],
  });

  // console.log("backend Subscription record",subscriptionRecord)
  const isSubscribed = !!subscriptionRecord;

  // console.log("backend >>>>>",isSubscribed)
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed: isSubscribed },
        "subscription checked"
      )
    );
});
