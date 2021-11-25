import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import CreatorSchema from "../creator/schema";
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

export default shopRoute;
