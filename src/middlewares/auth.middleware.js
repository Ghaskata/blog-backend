import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || //token cookies se nikalo
      req.header("Authorization")?.replace("Bearer ", ""); //ya token header se nikalo

    // console.log("req.cookies?.accessToken >>>>>> ", req.cookies?.accessToken);
    // console.log(
    //   "req.header('Authorization')?.replace('bearer ', '') >>>>>> ",
    //   req.header("Authorization")?.replace("bearer ", "")
    // );

    // console.log("req.cookie >>> ",req.cookies)
    // console.log("headers >>>>>  ",req.header)

    if (!token) {
      new ApiError(401, "unauthorize request");
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ); //verify only those who have secret
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "invaid access token");
    }

    req.user = user;

    next();
  } catch (error) {

    console.log("req.cookie >>> ",req.cookies)
    console.log("headers >>>>>  ",req.header)
    
    console.log("req.cookies?.accessToken >>>>>> ", req.cookies?.accessToken);
    console.log(
      "req.header('Authorization')?.replace('bearer ', '') >>>>>> ",
      req.header("Authorization")?.replace("bearer ", "")
    );
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
