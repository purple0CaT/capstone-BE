import express from "express";
import createHttpError from "http-errors";
import passport from "passport";
import UserSchema from "../../users/schema";
import { generateJWT } from "../tokens/token";
process.env.TS_NODE_DEV && require("dotenv").config();

const loginRoute = express.Router();

loginRoute.post("/", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.CheckCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await generateJWT(user);
      user.refreshToken = refreshToken;
      res.send({ user, tokens: { accessToken, refreshToken } });
    } else {
      next(createHttpError(401, "Not founded"));
    }
  } catch (error: any) {
    next(createHttpError(400, error._message));
  }
});
//
loginRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
loginRoute.get(
  "/googleRed",
  passport.authenticate("google"),
  async (req: any, res, next) => {
    try {
      // res.send({ user: req.user.user, tokens: req.user.tokens });
      res.redirect(
        `${process.env.CLIENT_URL}/googlelog?accessToken=${req.user.tokens.accessToken}&refToken=${req.user.tokens.refreshToken}`,
      );
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);

export default loginRoute;
