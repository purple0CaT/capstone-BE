import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import CreatorSchema from "../creator/schema";
import { ItemsSchema } from "./schema";
// import { ShopSchema } from "./schema";
//
const shopRoute = express.Router();
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
  async (req: any, res, next) => {
    try {
      const newItem = new ItemsSchema({
        ...req.body,
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
        { new: true }
      );
      res.send(creatorShop);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
shopRoute.get("/item/:itemId", authJWT, async (req, res, next) => {
  try {
    const item = await ItemsSchema.findById(req.params.itemId);
    res.send(item);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
shopRoute.put("/item/:itemId", authJWT, async (req, res, next) => {
  try {
    const item = await ItemsSchema.findByIdAndUpdate(
      req.params.itemId,
      req.body,
      { new: true }
    );
    res.send(item);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
shopRoute.delete("/item/:itemId", authJWT, async (req, res, next) => {
  try {
    const item = await ItemsSchema.findByIdAndDelete(req.params.itemId);
    res.send(item);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});

export default shopRoute;
