import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import UserSchema from "./schema";
import multer from "multer";

const userRoute = express.Router();
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "sandoraw-avatars",
    };
  },
});
//
userRoute.get("/", authJWT, async (req, res, next) => {
  try {
    const allUsers = await UserSchema.find();
    res.send(allUsers);
  } catch (error) {
    next(createHttpError(500));
  }
});
userRoute.get("/me", authJWT, async (req: any, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(createHttpError(500));
  }
});
userRoute.put(
  "/avatar",
  authJWT,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const user = await UserSchema.findByIdAndUpdate(
        req.user._id,
        {
          avatar: req.file.path,
        },
        { new: true }
      );
      res.send(user);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  }
);
userRoute.put("/", authJWT, async (req: any, res, next) => {
  try {
    const user = await UserSchema.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    });
    res.send(user);
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
userRoute.delete("/", authJWT, async (req: any, res, next) => {
  try {
    const user = await UserSchema.findByIdAndDelete(req.user._id);
    res.status(204);
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});

export default userRoute;
