import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file path on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(response);

    //file has been upload succesfully
    // console.log("file uploaded on cloudinary --- ", response.url);
    fs.unlinkSync(localFilePath); //remove locally saved temperory file if succesfully upload on cloud
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove locally saved temperory file if error accur at upload on cloud
    return null;
  }
};

const deleteOnCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    const response = await cloudinary.uploader.destroy(cloudinaryUrl);

    console.log(response);

    return response;
    
  } catch (error) {
    return null;
  }
};
export { uploadOnCloudinary, deleteOnCloudinary };
