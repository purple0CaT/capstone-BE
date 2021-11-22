import express from "express";
import createHttpError from "http-errors";
import UserSchema from "../../users/schema";
import { generateJWT } from "../tokens/token";

const registerRoute = express.Router();
//
registerRoute.post("/", async (req, res, next) => {
  try {
    const newUser = new UserSchema(req.body);
    console.log("User =>", newUser);
    const { accessToken, refreshToken } = await generateJWT(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();
    res.send({ user: newUser, tokens: { accessToken, refreshToken } });
  } catch (error) {
    next(createHttpError(400, "Fill all fields"));
  }
});

export default registerRoute;
