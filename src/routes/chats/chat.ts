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
chatRoute.get("/single/:chatId", authJWT, async (req, res, next) => {
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
chatRoute.get("/userChats", authJWT, async (req: any, res, next) => {
  try {
    const allChats = await ChatSchema.find({
      "members._id": req.user._id,
    }).sort("-updatedAt");
    if (allChats) {
      res.send(allChats);
    } else {
      next(createHttpError(404, "Chat not found!"));
    }
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
chatRoute.delete("/single/:chatId", authJWT, async (req, res, next) => {
  const chat = await ChatSchema.findByIdAndDelete(req.params.chatId);
  // console.log(chat);
  res.status(204).send({ message: "Deleted!" });
});
//
chatRoute.put("/single/:chatId", authJWT, async (req: any, res, next) => {
  try {
    const chat = await ChatSchema.findByIdAndUpdate(
      req.params.chatId,
      req.body,
      { new: true },
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
        { new: true },
      );
      res.send(chat);
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  },
);
//
chatRoute.post("/createChat/:userId", authJWT, async (req: any, res, next) => {
  try {
    const addedUser = await UserSchema.findById(req.params.userId);
    const checkCreatedChat = await ChatSchema.find({
      $and: [
        { "members._id": req.user._id },
        { "members._id": new ObjectId(req.params.userId) },
      ],
    });
    if (checkCreatedChat.length === 0) {
      const membersArray = [
        {
          _id: req.user!._id,
          firstname: req.user!.firstname,
          lastname: req.user!.lastname,
          avatar: req.user!.avatar,
        },
        {
          _id: new ObjectId(addedUser!._id),
          firstname: addedUser!.firstname,
          lastname: addedUser!.lastname,
          avatar: addedUser!.avatar,
        },
      ];
      const newChat = new ChatSchema({ ...req.body, members: membersArray });
      await newChat.save();
      const allChats = await ChatSchema.find({
        "members._id": req.user._id,
      }).sort("-updatedAt");
      res.send({ newChat, allChats });
    } else {
      next(createHttpError(400, "Chat already created"));
    }
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
        { new: true },
      );
      const allChats = await ChatSchema.find({
        "members._id": req.user._id,
      }).sort("-updatedAt");
      res.send({ chat, allChats });
    } catch (error) {
      // console.log(error)
      next(createHttpError(500, error as any));
    }
  },
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
        { new: true },
      );
      const Chats = await ChatSchema.find({
        "members._id": req.user._id,
      }).sort("-updatedAt");
      res.send({ chat: Mychat, allChats: Chats });
    } catch (error) {
      // console.log(error);
      next(createHttpError(500, error as any));
    }
  },
);
chatRoute.delete(
  "/deleteChat/:chatId",
  authJWT,
  async (req: any, res, next) => {
    try {
      const delChat = await ChatSchema.findByIdAndDelete(req.params.chatId);
      const allChats = await ChatSchema.find({
        "members._id": req.user._id,
      }).sort("-updatedAt");
      res.send({ chat: allChats[0], allChats });
    } catch (error) {
      next(createHttpError(500, error as any));
    }
  },
);
export default chatRoute;
