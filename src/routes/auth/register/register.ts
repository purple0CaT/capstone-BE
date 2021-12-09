import express from "express";
import createHttpError from "http-errors";
import UserSchema from "../../users/schema";
import { generateJWT } from "../tokens/token";
import FollowSchema from "./../../followers/schema";

const registerRoute = express.Router();
//
registerRoute.post("/", async (req, res, next) => {
  try {
    const checkEmail = await UserSchema.findOne({ email: req.body.email });
    if (checkEmail) next(createHttpError(401, "Email already exists!"));
    //
    const UserFollowers = new FollowSchema({
      youFollow: [],
      followers: [],
    });
    await UserFollowers.save();
    //
    const newUser = new UserSchema(req.body);
    const { accessToken, refreshToken } = await generateJWT(newUser);
    newUser.refreshToken = refreshToken;
    newUser.followers = UserFollowers._id;
    await newUser.save();
    res
      .status(201)
      .send({ user: newUser, tokens: { accessToken, refreshToken } });
  } catch (error) {
    next(createHttpError(400, "Fill all fields"));
  }
});

export default registerRoute;
