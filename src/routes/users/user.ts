import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";

const userRoute = express.Router();

userRoute.post("/", async (req, res, next) => {});
userRoute.get("/me", authJWT, async (req: any, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(createHttpError(500));
  }
});

export default userRoute;
