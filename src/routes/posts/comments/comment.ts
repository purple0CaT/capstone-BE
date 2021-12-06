import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../../middlewares/authorization/tokenCheck";
import CommentSchema from "./schema";
import PostSchema from "../schema";
//
const commentRoute = express.Router();
//
commentRoute.get("/", authJWT, async (req: any, res, next) => {
  try {
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
commentRoute.get("/:commentId", authJWT, async (req: any, res, next) => {
  try {
    const comment = await CommentSchema.findById(req.params.commentId);
    res.send(comment);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
commentRoute.delete("/:commentId", authJWT, async (req: any, res, next) => {
  try {
    const comment = await CommentSchema.findByIdAndDelete(req.params.commentId);
    res.status(203).send();
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
commentRoute.post("/add/:postId", authJWT, async (req: any, res, next) => {
  try {
    const comment = new CommentSchema({
      ...req.body,
      author: {
        _id: req.user._id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        avatar: req.user.avatar,
      },
    });
    await comment.save();
    const post = await PostSchema.findByIdAndUpdate(req.params.postId, {
      $push: { comments: comment._id },
    });
    res.status(201).send(post);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});

export default commentRoute;
