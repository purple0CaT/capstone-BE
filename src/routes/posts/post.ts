import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import PostSchema from "./schema";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import mongoose from "mongoose";
import FollowSchema from "./../followers/schema";
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
      .populate([
        {
          path: "comments",
          populate: {
            path: "author",
            select: ["firstname", "lastname", "avatar"],
          },
        },
        {
          path: "author",
          select: ["firstname", "lastname", "avatar", "creator"],
        },
      ]);

    res.send(allPosts);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.get("/followed", authJWT, async (req: any, res, next) => {
  try {
    const followed = await FollowSchema.findById(req.user.followers);
    const userFollow = followed.youFollow.map((F: any) => ({
      author: F,
    }));
    if (userFollow.length > 0) {
      const allPosts = await PostSchema.find({ $or: userFollow })
        .sort("-createdAt")
        .populate([
          {
            path: "comments",
            populate: {
              path: "author",
              select: ["firstname", "lastname", "avatar"],
            },
          },
          {
            path: "author",
            select: ["firstname", "lastname", "avatar", "creator"],
          },
        ]);
      res.send(allPosts);
    } else {
      res.send([]);
    }
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.get("/single/:postId", authJWT, async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.postId).populate([
      {
        path: "comments",
        populate: {
          path: "author",
          select: ["firstname", "lastname", "avatar"],
        },
      },
      {
        path: "author",
        select: ["firstname", "lastname", "avatar", "creator"],
      },
    ]);
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.get("/userPosts/:userId", authJWT, async (req, res, next) => {
  try {
    const post = await PostSchema.find({
      author: new ObjectId(req.params.userId),
    })
      .populate([
        {
          path: "comments",
          populate: {
            path: "author",
            select: ["firstname", "lastname", "avatar"],
          },
        },
        {
          path: "author",
          select: ["firstname", "lastname", "avatar", "creator"],
        },
      ])

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
      let editBody;
      if (req.body.locCord) {
        editBody = {
          text: req.body.text,
          location: {
            title: req.body.locTitle,
            cord: req.body.locCord.split(", "),
          },
        };
      } else {
        editBody = req.body;
      }
      const newPost = new PostSchema({
        ...editBody,
        media: req.file.path,
        author: req.user._id,
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
    ).populate([
      {
        path: "comments",
        populate: {
          path: "author",
          select: ["firstname", "lastname", "avatar"],
        },
      },
      {
        path: "author",
        select: ["firstname", "lastname", "avatar", "creator"],
      },
    ]);
    res.send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
postRoute.delete("/single/:postId", async (req, res, next) => {
  try {
    await PostSchema.findByIdAndDelete(req.params.postId);
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
