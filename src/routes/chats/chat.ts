import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import ChatSchema from "./schema";
import UserSchema from "../users/schema";

const chatRoute = express.Router();
chatRoute
  .route("/:chatId")
  .get(async (req, res, next) => {
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
  })
  .delete(async (req, res, next) => {
    const chat = await ChatSchema.findByIdAndDelete(req.params.chatId);
    console.log(chat);
  });
chatRoute.post("/createChat/:userId", authJWT, async (req: any, res, next) => {
  try {
    const addedUser = await UserSchema.findById(req.params.userId);
    const membersArray = [
      {
        _id: req.user._id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        avatar: req.user.avatar,
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
    const allChats = await ChatSchema.find({
      "members._id": req.user._id,
    });
    res.send({ chat: newChat, allChats });
  } catch (error) {
    next(createHttpError(500, error as any));
  }
});
chatRoute
  .route("/:userId/:chatId")
  .post(authJWT, async (req: any, res, next) => {
    // console.log(req.params.userId, req.params.chatId);
    try {
      const addedUser = await UserSchema.findById(req.params.userId);
      console.log(addedUser);
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
  })
  .delete(authJWT, async (req: any, res, next) => {
    try {
      const Mychat = await ChatSchema.findByIdAndUpdate(
        req.params.chatId,
        {
          $pull: { members: { _id: req.params.userId } },
        },
        { new: true }
      );
      // const Mychat = await ChatSchema.find({
      //   "members._id": req.params.userId,
      // });
      console.log(req.params.userId);
      console.log(Mychat);
      const allChats = await ChatSchema.find({
        "members._id": req.user._id,
      });
      res.send({ chat: Mychat, allChats });
    } catch (error) {
      console.log(error);
      next(createHttpError(500, error as any));
    }
  });

export default chatRoute;
