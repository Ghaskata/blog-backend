import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpeg_static from "ffmpeg-static";
import path from "path";
import { getVideoDurationInSeconds } from "get-video-duration";
import fs from "fs";

function asyncThumbnail(videoPath) {
  const videoFileFolder = path.dirname(videoPath).replace(/\\/g, "/");

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setFfmpegPath(ffmpeg_static)
      .screenshots({
        size: "?x512",
        count: 1,
        timemarks: ["5"],
        filename: `thumbnail.jpg`,
        folder: videoFileFolder,
      })
      .on("end", function () {
        console.log("Thusmbnail created");
        return resolve(`${videoFileFolder}/thumbnail.jpg`);
      })
      .on("error", (err) => {
        return reject(new Error(err));
      });
  });
}

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType, userId } = req.query;

  const pipline = [];

  //   match stage according userId
  if (userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const userExist = await User.findById(userObjectId);
    if (!userExist) {
      throw new ApiError(404, "user not found");
    }
    if (userExist._id.toString() === req.user._id.toString()) {
      pipline.push({ $match: { _id: userObjectId } });
    } else {
      pipline.push({
        $match: { $and: [{ _id: userObjectId }, { isPublished: true }] },
      });
    }
  } else {
    pipline.push({ $match: { isPublished: true } });
  }

  // sort stage
  const sortStage = {};
  sortStage[sortBy || "_id"] = sortType === "desc" ? -1 : 1;
  console.log("sort stage >> ", sortStage);
  pipline.push({ $sort: sortStage });

  //   pagination option
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  console.log("pipline > >  ", pipline);
  console.log("options > >  ", options);
  // const allVideos = await Video.aggregatePaginate(pipline, options);

  const allVideos = await Video.aggregate(pipline);

  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos are fetched"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "all ffields are require are required");
  }
  const videoFileLocalPath = req.file?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is missing");
  }

  const duration = await getVideoDurationInSeconds(videoFileLocalPath);

  const thumbmailLocalPath = await asyncThumbnail(videoFileLocalPath);

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new ApiError(400, "error while uploading video on cloudinary");
  }
  const thumbnail = await uploadOnCloudinary(thumbmailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "error while uploading thumbnail on cloudinary");
  }

  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    owner: req.user._id,
    duration,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, createdVideo, "video publish sucessfully"));
});
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "video id not found");
  }
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(404, "video is not exist");
  }

  return res.status(200).json(new ApiResponse(200, videoExist, "video found"));
});
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // title,description,thumbnail
  const { title, description } = req.body;
  const thumbmailLocalPath = req.file?.path;

  if (!videoId) {
    throw new ApiError(404, "video id not found");
  }
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(404, "video is not exist");
  }

  if (videoExist.owner.toString() !== req.user._id.toString()) {
    fs.unlinkSync(thumbmailLocalPath);
    throw new ApiError(
      402,
      "only video owner can change video you are not owner of this video"
    );
  }

  if (!title || !description) {
    throw new ApiError(404, "title and description  files is require");
  }

  if (!thumbmailLocalPath) {
    throw new ApiError(400, "thumbmail file is missing");
  }

  const deleteOldThumbnailInCloudinary = await deleteOnCloudinary(
    videoExist.thumbnail
  );
  if (!deleteOldThumbnailInCloudinary) {
    throw new ApiError(500, "error while deleting old file from cloudinary");
  }

  const thumbmail = await uploadOnCloudinary(thumbmailLocalPath);
  if (!thumbmail) {
    throw new ApiError(400, "error while uploading on cloudinary");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoObjectId,
    {
      $set: {
        title,
        description,
        thumbmail,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "video id not found");
  }
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(404, "video is not exist");
  }
  if (videoExist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      402,
      "only video owner can delete video you are not owner of this video"
    );
  }

  const deleteVideoFileOnCloudinary = await deleteOnCloudinary(
    videoExist.videoFile
  );
  const deleteThumbnailOnCloudinary = await deleteOnCloudinary(
    videoExist.thumbnail
  );

  if (!deleteThumbnailOnCloudinary || !deleteVideoFileOnCloudinary) {
    throw new ApiError(500, "error white deleting from cloudinary");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoObjectId);
  if (!deletedVideo) {
    throw new ApiError(500, "error white deleting video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video delted succesfully"));
});
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "video id not found");
  }
  const videoObjectId = new mongoose.Types.ObjectId(videoId);
  const videoExist = await Video.findById(videoObjectId);
  if (!videoExist) {
    throw new ApiError(404, "video is not exist");
  }

  if (videoExist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(402, "only video owner can manage toggle permision");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoObjectId,
    {
      $set: {
        isPublished: !videoExist.isPublished,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
