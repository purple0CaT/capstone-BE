import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import CreatorSchema from "../creator/schema";
import { ItemsSchema } from "../shop/schema";
import UserSchema from "../users/schema";
import OrderSchema from "./schema";
//
const orderRoute = express.Router();
//
orderRoute.get(
  "/:orderId",
  authJWT,
  creatorAuth,
  async (req: any, res, next) => {
    try {
      const orders = await OrderSchema.findById(req.params.orderId);
      res.send(orders);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
orderRoute.get("/", authJWT, creatorAuth, async (req: any, res, next) => {
  try {
    const orders = await OrderSchema.find();
    res.send(orders);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
orderRoute.post("/createOrder", authJWT, async (req: any, res, next) => {
  try {
    //   Create new order and update avaible items in store
    const newOrder = new OrderSchema({ ...req.body, customerId: req.user._id });
    await newOrder.save();
    // Update items quantity in store
    req.body.items.map(
      async (I: any) =>
        await ItemsSchema.findByIdAndUpdate(I.item._id, {
          $inc: { quantity: -I.qty },
        })
    );
    //
    const myUser = await UserSchema.findByIdAndUpdate(
      req.user._id,
      {
        $push: { "shopping.orders": newOrder._id },
      },
      { new: true }
    );
    //
    const sellerUser = await UserSchema.findById(req.body.sellerId);
    const sellerCreator = await CreatorSchema.findByIdAndUpdate(
      sellerUser!.creator,
      { $push: { "shop.orders": newOrder._id } },
      { new: true }
    );
    //==== PayPal logic
    //  <>
    //
    res.status(201).send(myUser);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
export default orderRoute;
