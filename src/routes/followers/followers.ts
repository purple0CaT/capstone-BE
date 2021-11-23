import express from "express";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import UserSchema from "../users/schema";
import FollowSchema from "../followers/schema";
import createHttpError from "http-errors";
//
const followRoute = express.Router();
// Follow smbdy
followRoute.post("/:userId", authJWT, async (req: any, res, next) => {
  console.log(req.user);
  try {
    //
    const myUser = await UserSchema.findById(req.user._id.toString());
    if (myUser!.followers) {
      const myFollower = await FollowSchema.findByIdAndUpdate(
        myUser!.followers,
        { $push: { youFollow: req.params.userId } },
        { new: true }
      );
    } else {
      const myFollower = new FollowSchema({ youFollow: [req.params._id] });
      await myFollower.save();
      myUser!.followers = myFollower._id.toString();
      await myUser!.save();
    }
    //   followed user logic update
    const followedUser = await UserSchema.findById(req.params.userId);
    if (followedUser!.followers) {
      await FollowSchema.findByIdAndUpdate(followedUser!.followers.toString(), {
        $push: { followers: myUser!._id.toString() },
      });
    } else {
      const newUserFollowers = new FollowSchema({
        followers: [myUser!._id.toString()],
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
      { $pull: { youFollow: req.params.userId } },
      { new: true }
    );
    const followedUser = await UserSchema.findById(req.params.userId);
    const userFollowers = await FollowSchema.findByIdAndUpdate(
      followedUser?.followers,
      { $pull: { followers: req.user._id } }
    );
    res.send(myFollowers);
  } catch (error) {
    next(createHttpError(500));
  }
});
export default followRoute;
