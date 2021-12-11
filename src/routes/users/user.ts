import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import UserSchema from "./schema";
import FollowSchema from "../followers/schema";
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
userRoute
  .route("/")
  .get(authJWT, async (req, res, next) => {
    try {
      const { search }: any = req.query;
      let allUsers;
      if (search.length > 1) {
        allUsers = await UserSchema.find({
          $or: [
            { firstname: { $regex: `${search}`, $options: "i" } },
            { lastname: { $regex: `${search}`, $options: "i" } },
          ],
        }).select(["_id", "firstname", "lastname", "email", "avatar"]);
      } else {
        allUsers = await UserSchema.find();
      }
      res.send(allUsers);
    } catch (error) {
      next(createHttpError(500));
    }
  })
  .put(authJWT, async (req: any, res, next) => {
    try {
      const user = await UserSchema.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
      });
      res.send(user);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  })
  .delete(authJWT, async (req: any, res, next) => {
    try {
      const user = await UserSchema.findByIdAndDelete(req.user._id);
      res.status(204);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  });
userRoute.get("/me", authJWT, async (req: any, res, next) => {
  try {
    const followers = await FollowSchema.findById(req.user.followers).populate([
      "followers",
      "youFollow",
    ]);
    res.send({ user: req.user, followers });
  } catch (error) {
    console.log(error);
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
        { new: true },
      );
      res.send(user);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  },
);
userRoute.put(
  "/background",
  authJWT,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const user = await UserSchema.findByIdAndUpdate(
        req.user._id,
        {
          background: req.file.path,
        },
        { new: true },
      );
      res.send(user);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  },
);
userRoute.get("/single/:userId", authJWT, async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.userId).populate("shopping.orders")
    const followers = await FollowSchema.findById(user!.followers).populate([
      "followers",
      "youFollow",
    ]);
    res.send({ user, followers });
  } catch (error) {
    next(createHttpError(500));
  }
});
userRoute.put("/single/:userId", authJWT, async (req, res, next) => {
  try {
    const user = await UserSchema.findByIdAndUpdate(
      req.params.userId,
      req.body,
    );
    const followers = await FollowSchema.findById(user!.followers).populate([
      "followers",
      "youFollow",
    ]);
    res.send({ user, followers });
  } catch (error) {
    next(createHttpError(500));
  }
});

export default userRoute;
