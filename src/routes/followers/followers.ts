import express from "express";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import UserSchema from "../users/schema";
import FollowSchema from "../followers/schema";
import createHttpError from "http-errors";
import mongoose from "mongoose";
//
const ObjectId = mongoose.Types.ObjectId;
//
const followRoute = express.Router();
// Follow smbdy
followRoute.post("/:userId", authJWT, async (req: any, res, next) => {
  try {
    //
    const myUser = await UserSchema.findById(req.user._id.toString());
    const followedUser: any = await UserSchema.findById(req.params.userId);
    await FollowSchema.findByIdAndUpdate(myUser!.followers!.toString(), {
      $push: {
        youFollow: followedUser._id,
      },
    });
    await FollowSchema.findByIdAndUpdate(followedUser!.followers.toString(), {
      $push: {
        followers: req.user._id,
      },
    });
    res.send(myUser);
  } catch (error) {
    console.log(error);
    next(createHttpError(500, error as Error));
  }
});
// Unfollow smbdy
followRoute.delete("/:userId", authJWT, async (req: any, res, next) => {
  try {
    const myFollowers = await FollowSchema.findByIdAndUpdate(
      req.user.followers,
      { $pull: { youFollow: new ObjectId(req.params.userId) } },
      { new: true },
    );
    const followedUser = await UserSchema.findById(req.params.userId);
    await FollowSchema.findByIdAndUpdate(followedUser?.followers, {
      $pull: { followers: req.user._id },
    });
    res.send(myFollowers);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
export default followRoute;
