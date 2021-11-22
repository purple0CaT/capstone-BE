import e from "cors";
import express from "express";
import createHttpError from "http-errors";
import UserSchema from "../../users/schema";
import { generateJWT } from "../tokens/token";

const loginRoute = express.Router();

loginRoute.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.CheckCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await generateJWT(user);
      user.refreshToken = refreshToken;
      await user.save();
      res.send({ user, tokens: { accessToken, refreshToken } });
    } else {
      next(createHttpError(400, "Bad request"));
    }
  } catch (error) {
    next(createHttpError(500));
  }
});

export default loginRoute;
