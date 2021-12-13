import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import CreatorSchema from "../creator/schema";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { ItemsSchema } from "./schema";
import multer from "multer";
import mongoose from "mongoose";
//
const ObjectId = mongoose.Types.ObjectId;
//
const shopRoute = express.Router();
//
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "sandoraw-items",
    };
  },
});
//
shopRoute.get("/", authJWT, creatorAuth, async (req: any, res, next) => {
  try {
    const creator = await CreatorSchema.findById(req.user.creator);
    if (creator) {
      // const myShop = await ShopSchema.findById(creator.shop);
      res.send("Ok");
    }
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
shopRoute.post(
  "/addItem",
  authJWT,
  creatorAuth,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const newItem = new ItemsSchema({
        ...req.body,
        image: req.file.path,
        type: "user",
        sellerId: req.user._id,
      });
      await newItem.save();
      //
      const creatorShop = await CreatorSchema.findByIdAndUpdate(
        req.user.creator,
        {
          $push: {
            "shop.items": newItem._id,
          },
        },
        { new: true },
      );
      res.send(creatorShop);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);
shopRoute.get("/item/:itemId", authJWT, creatorAuth, async (req, res, next) => {
  try {
    const item = await ItemsSchema.findById(req.params.itemId);
    res.send(item);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
shopRoute.put(
  "/item/:itemId",
  authJWT,
  creatorAuth,
  multer({ storage: storage }).single("media"),
  async (req: any, res, next) => {
    try {
      const bodyUpdate = req.file?.path
        ? { ...req.body, image: req.file.path }
        : req.body;
      const item = await ItemsSchema.findByIdAndUpdate(
        req.params.itemId,
        bodyUpdate,
        { new: true },
      );
      res.send(item);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);
shopRoute.delete(
  "/item/:itemId",
  authJWT,
  creatorAuth,
  async (req: any, res, next) => {
    try {
      const creator = await CreatorSchema.findByIdAndUpdate(req.user.creator, {
        $pull: { "shop.orders": new ObjectId(req.params.itemId) },
      });
      const item = await ItemsSchema.findByIdAndDelete(req.params.itemId);
      res.send({ message: "Deleted!" });
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);

export default shopRoute;
