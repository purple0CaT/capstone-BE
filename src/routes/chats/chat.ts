import { v2 as cloudinary } from "cloudinary";
import express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import UserSchema from "../users/schema";
import ChatSchema from "./schema";
//
const ObjectId = mongoose.Types.ObjectId;
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "sandoraw-chats",
    };
  },
});
//
const chatRoute = express.Router();
chatRoute.get("/:chatId", authJWT, async (req, res, next) => {
  try {
    const chat = await ChatSchema.findById(req.params.chatId);
    if (chat) {
      res.send(chat);
    } else {
      next(createHttpError(404, "Chat not found!"));
    }
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
chatRoute.delete("/:chatId", authJWT, async (req, res, next) => {
  const chat = await ChatSchema.findByIdAndDelete(req.params.chatId);
  // console.log(chat);
  res.status(204).send({ message: "Deleted!" });
});
//
chatRoute.put("/:chatId", authJWT, async (req: any, res, next) => {
  try {
    const chat = await ChatSchema.findByIdAndUpdate(
      req.params.chatId,
      req.body,
      { new: true }
    );
    res.send(chat);
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
chatRoute.put(
  "/image/:chatId",
  multer({ storage: storage }).single("media"),
  authJWT,
  async (req: any, res, next) => {
    try {
      const chat = await ChatSchema.findByIdAndUpdate(
        req.params.chatId,
        req.body,
        { new: true }
      );
      res.send(chat);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  }
);
//
chatRoute.post("/createChat/:userId", authJWT, async (req: any, res, next) => {
  try {
    const addedUser = await UserSchema.findById(req.params.userId);
    const membersArray = [
      {
        _id: req.user!._id,
        firstname: req.user!.firstname,
        lastname: req.user!.lastname,
        avatar: req.user!.avatar,
      },
      {
        _id: addedUser!._id,
        firstname: addedUser!.firstname,
        lastname: addedUser!.lastname,
        avatar: addedUser!.avatar,
      },
    ];
    const newChat = new ChatSchema({ ...req.body, members: membersArray });
    await newChat.save();
    res.send({ chat: newChat });
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
chatRoute.post(
  "/addUser/:userId/:chatId",
  authJWT,
  async (req: any, res, next) => {
    // console.log(req.user);
    try {
      const addedUser = await UserSchema.findById(req.params.userId);
      const chat = await ChatSchema.findByIdAndUpdate(
        req.params.chatId,
        {
          $push: {
            members: {
              _id: addedUser!._id,
              firstname: addedUser!.firstname,
              lastname: addedUser!.lastname,
              avatar: addedUser!.avatar,
            },
          },
        },
        { new: true }
      );
      const allChats = await ChatSchema.find({
        "members._id": req.user._id,
      });
      res.send({ chat, allChats });
    } catch (error) {
      // console.log(error)
      next(createHttpError(500, error as any));
    }
  }
);
chatRoute.delete(
  "/deleteUser/:userId/:chatId",
  authJWT,
  async (req: any, res, next) => {
    try {
      const Mychat = await ChatSchema.findByIdAndUpdate(
        req.params.chatId,
        {
          $pull: { members: { _id: new ObjectId(req.params.userId) } },
        },
        { new: true }
      );
      const Chats = await ChatSchema.find({
        "members._id": req.user._id,
      });
      res.send({ chat: Mychat, allChats: Chats });
    } catch (error) {
      // console.log(error);
      next(createHttpError(500, error as any));
    }
  }
);

export default chatRoute;
