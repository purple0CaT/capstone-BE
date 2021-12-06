import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import PostSchema from "./schema";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import mongoose from "mongoose";
//
const ObjectId = mongoose.Types.ObjectId;

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
    const allPosts = await PostSchema.find({})
      .sort("-createdAt")
      .populate("comments");
    res.send(allPosts);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.get("/single/:postId", authJWT, async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.postId).populate(
      "comments",
    );
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.get("/userPosts/:userId", authJWT, async (req, res, next) => {
  try {
    const post = await PostSchema.find({
      "author._id": new ObjectId(req.params.userId),
    })
      .populate("comments")
      .sort("-createdAt");
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.post("/likes/:postId", authJWT, async (req: any, res, next) => {
  try {
    const post: any = await PostSchema.findById(req.params.postId);
    const liked = post!.likes.some(
      (L: string) => L === req.user._id.toString(),
    );
    if (liked) {
      await PostSchema.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.user._id.toString() },
      });
    } else {
      await PostSchema.findByIdAndUpdate(req.params.postId, {
        $push: { likes: req.user._id.toString() },
      });
    }
    res.send({ message: "Liked" });
  } catch (error) {
    next(createHttpError(500, error as Error));
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
      next(createHttpError(500, error as Error));
    }
  },
);

postRoute.put("/single/:postId", async (req, res, next) => {
  try {
    const post = await PostSchema.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true },
    ).populate("author");
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.delete("/single/:postId", async (req, res, next) => {
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
      next(createHttpError(500, error as Error));
    }
  },
);

export default postRoute;
