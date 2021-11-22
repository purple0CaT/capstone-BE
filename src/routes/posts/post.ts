import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import PostSchema from "./schema";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
//
const postRoute = express.Router();
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "sandoraw-posts",
    };
  },
});
//
postRoute.get("/", authJWT, async (req, res, next) => {
  try {
    const allPosts = await PostSchema.find().populate("author");
    res.send(allPosts);
  } catch (error) {
    next(createHttpError(500));
  }
});
//
postRoute.post(
  "/",
  authJWT,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const newPost = new PostSchema({
        ...req.body,
        media: req.file.path,
        author: req.user._id,
      });
      await newPost.save();
      res.send(newPost);
    } catch (error) {
      next(createHttpError(500));
    }
  }
);

export default postRoute;
