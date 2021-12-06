import express from "express";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import UserSchema from "../users/schema";
import FollowSchema from "../followers/schema";
import createHttpError from "http-errors";
//
const followRoute = express.Router();
// Follow smbdy
followRoute.post("/:userId", authJWT, async (req: any, res, next) => {
  try {
    //
    const myUser = await UserSchema.findById(req.user._id.toString());
    const followedUser: any = await UserSchema.findById(req.params.userId);
    if (myUser!.followers) {
      await FollowSchema.findByIdAndUpdate(myUser!.followers, {
        $push: {
          youFollow: {
            _id: followedUser._id,
            firstname: followedUser.firstname,
            lastname: followedUser.lastname,
            avatar: followedUser.avatar,
          },
        },
      });
    } else {
      const myFollower = new FollowSchema({
        youFollow: [
          {
            _id: followedUser._id,
            firstname: followedUser.firstname,
            lastname: followedUser.lastname,
            avatar: followedUser.avatar,
          },
        ],
        followers: [],
      });
      await myFollower.save();
      myUser!.followers = myFollower._id.toString();
      await myUser!.save();
    }
    //   followed user logic update
    if (followedUser.followers) {
      await FollowSchema.findByIdAndUpdate(followedUser!.followers.toString(), {
        $push: {
          followers: {
            _id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            avatar: req.user.avatar,
          },
        },
      });
    } else {
      const newUserFollowers = new FollowSchema({
        followers: [
          {
            _id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            avatar: req.user.avatar,
          },
        ],
        youFollow: [],
      });
      await newUserFollowers.save();
      followedUser!.followers = newUserFollowers._id;
      await followedUser!.save();
    }
    //   End of followed User logic
    res.send(myUser);
  } catch (error) {
    console.log(error);
    next(createHttpError(500, error as any));
  }
});
// Unfollow smbdy
followRoute.delete("/:userId", authJWT, async (req: any, res, next) => {
  try {
    const myFollowers = await FollowSchema.findByIdAndUpdate(
      req.user.followers,
      { $pull: { youFollow: { _id: req.params.userId } } },
      { new: true },
    );
    const followedUser = await UserSchema.findById(req.params.userId);
    const userFollowers = await FollowSchema.findByIdAndUpdate(
      followedUser?.followers,
      { $pull: { followers: { _id: req.user._id } } },
    );
    res.send(myFollowers);
  } catch (error) {
    next(createHttpError(500));
  }
});
export default followRoute;
