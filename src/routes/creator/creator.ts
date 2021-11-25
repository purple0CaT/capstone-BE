import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import { CreatorType } from "../../types/creator";
import { ItemsSchema } from "../shop/schema";
import UserSchema from "../users/schema";
import CreatorSchema from "./schema";
//
const creatorRoute = express.Router();
//
creatorRoute.get("/me", authJWT, creatorAuth, async (req: any, res, next) => {
  try {
    const userInfo = await UserSchema.findById(req.user._id).populate([
      "creator",
      "creator.shop.orders",
      "shopping.cart",
    ]);
    res.send(userInfo);
  } catch (error) {
    console.log(500);
    next(createHttpError(500, error as any));
  }
});
creatorRoute.post("/beCreator", authJWT, async (req: any, res, next) => {
  try {
    const userInfo = await UserSchema.findById(req.user._id);
    if (!userInfo!.creator) {
      const newItem1 = new ItemsSchema({
        title: "Landscape printed picture",
        price: 10,
        descrition:
          "Landscape printed picture of selected post with sizes: 16:9",
        quantity: 10,
        seller: req.user._id,
      });
      const newItem2 = new ItemsSchema({
        title: "Portret printed picture",
        price: 10,
        descrition: "Portret printed picture of selected post with sizes: 3:4",
        quantity: 10,
        seller: req.user._id,
      });
      const creator = new CreatorSchema({
        ...req.body,
        shop: { items: [newItem1, newItem2] },
      });
      await creator.save();
      userInfo!.creator = creator._id;
      await userInfo!.save();
      res.send(userInfo);
    } else {
      next(createHttpError(400, " You are already a creator!"));
    }
  } catch (error) {
    console.log(500);
    next(createHttpError(500, error as any));
  }
});
creatorRoute.delete(
  "/beUser",
  authJWT,
  creatorAuth,
  async (req: any, res, next) => {
    try {
      const creator: CreatorType | any = await CreatorSchema.findById(
        req.user.creator
      );
      if (creator) {
        const creatorDel = await CreatorSchema.findOneAndDelete(
          req.user.creator
        );
        const user = await UserSchema.findByIdAndUpdate(
          req.user._id,
          {
            creator: null,
          },
          { new: true }
        );
        res.send(user);
      } else {
        next(createHttpError(404, "You are not creator!"));
      }
    } catch (error) {
      console.log(500);
      next(createHttpError(500, error as any));
    }
  }
);

export default creatorRoute;
