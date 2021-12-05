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
    const allPosts = await PostSchema.find();
    console.log("allPosts");
    res.send(allPosts);
  } catch (error) {
    next(createHttpError(500));
  }
});
postRoute.get("/:postId", authJWT, async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.postId);
    res.send(post);
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
        author: {
          _id: req.user._id,
          firstname: req.user.firstname,
          lastname: req.user.lastname,
          avatar: req.user.avatar,
        },
      });
      await newPost.save();
      res.send(newPost);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  }
);

postRoute.put("/:postId", async (req, res, next) => {
  try {
    const post = await PostSchema.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true }
    ).populate("author");
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
postRoute.delete("/:postId", async (req, res, next) => {
  try {
    const post = await PostSchema.findByIdAndDelete(req.params.postId);
    res.status(201).send({ message: "Deleted!" });
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.put(
  "/media/:postId",
  authJWT,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const post = await PostSchema.findByIdAndUpdate({
        ...req.body,
        media: req.file.path,
        author: req.user._id,
      });
      res.send(post);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  }
);

export default postRoute;
