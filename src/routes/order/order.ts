import express, { Request } from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import CreatorSchema from "../creator/schema";
import { ItemsSchema } from "../shop/schema";
import UserSchema from "../users/schema";
import OrderSchema from "./schema";
import Stripe from "stripe";
//
const stripe = new Stripe(process.env.STRIPE_SK!, {
  apiVersion: "2020-08-27",
});
const orderRoute = express.Router();
//

orderRoute.get("/", authJWT, async (req: any, res, next) => {
  try {
    const orders = await OrderSchema.find();
    res.send(orders);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
orderRoute.get(
  "/:orderId",
  authJWT,
  // creatorAuth,
  async (req: any, res, next) => {
    try {
      const orders = await OrderSchema.findById(req.params.orderId);
      res.send(orders);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
// Only DEFAULT items
orderRoute.get("/adminOrders", authJWT, async (req: any, res, next) => {
  try {
    const orders = await OrderSchema.find({ "items.item.type": "default" });
    res.send(orders);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
orderRoute.put(
  "/delivery/:orderId",
  authJWT,
  creatorAuth,
  async (req: Request, res, next) => {
    try {
      const order = await OrderSchema.findByIdAndUpdate(
        req.params.orderId,
        { deliveryCodeTracking: req.body.deliveryCodeTracking },
        { new: true }
      );
      res.send(order);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
// ============= ORDER create|cancel
orderRoute.post("/createOrder", authJWT, async (req: any, res, next) => {
  try {
    //   Create new order
    const newOrder = new OrderSchema({ ...req.body, customerId: req.user._id });
    await newOrder.save();
    // Update items quantity in store
    req.body.items.map(
      async (I: any) =>
        await ItemsSchema.findByIdAndUpdate(I.item._id, {
          $inc: { quantity: -I.qty },
        })
    );
    // user update
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
    res.status(201).send(newOrder);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
orderRoute.delete(
  "/cancelorder/:orderId",
  authJWT,
  async (req: any, res, next) => {
    try {
      const order = await OrderSchema.findById(req.params.orderId);
      order.items.map(
        async (I: any) =>
          await ItemsSchema.findByIdAndUpdate(I.item._id, {
            $inc: { quantity: I.qty },
          })
      );
      // Update user orders
      await UserSchema.findByIdAndUpdate(order.customerId, {
        $pull: { "shopping.orders": req.params.orderId },
      });
      // update creator orders
      const seller = await UserSchema.findById(order.sellerId);
      await CreatorSchema.findByIdAndUpdate(seller!.creator, {
        $pull: { "shop.orders": req.params.orderId },
      });
      await OrderSchema.findByIdAndDelete(req.params.orderId);
      // =>
      res.status(203).send({ message: "Order canceled!" });
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
// PAYMENTS
orderRoute.put(
  "/submitpay/:orderId",
  authJWT,
  creatorAuth,
  async (req: Request, res, next) => {
    try {
      const order = await OrderSchema.findByIdAndUpdate(
        req.params.orderId,
        { paid: req.body.paid },
        { new: true }
      );
      res.send(order);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
orderRoute.post(
  "/checkout-session/:orderId",
  authJWT,
  async (req: any, res, next) => {
    try {
      const order = await OrderSchema.findById(req.params.orderId);
      if (req.user._id.toString() !== order.customerId.toString()) {
        next(createHttpError(400, "You cannot purchase this order!"));
      } else {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: order.items.map((I: any) => {
            return {
              price_data: {
                currency: "gbp",
                product_data: {
                  name: I.item.title,
                },
                unit_amount: I.item.price * 100,
              },
              quantity: I.qty,
            };
          }),
          success_url: `${process.env.CLIENT_URL}/success/${req.params.orderId}`,
          cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });
        res.send({ url: session.url });
      }
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
export default orderRoute;
