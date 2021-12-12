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
      "shopping.cart",
    ]);
    const creatorInfo = await CreatorSchema.findById(req.user.creator).populate(
      ["shop.items", "shop.orders"],
    );
    res.send({ creator: creatorInfo });
  } catch (error) {
    console.log(500);
    next(createHttpError(500, error as any));
  }
});
creatorRoute.get("/single/:creatorId", authJWT, async (req, res, next) => {
  try {
    const creator = await CreatorSchema.findById(req.params.creatorId).populate(
      ["booking.appointments", "shop.items"],
    );
    res.send(creator);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
creatorRoute.post("/beCreator", authJWT, async (req: any, res, next) => {
  try {
    const userInfo = await UserSchema.findById(req.user._id);
    if (userInfo!.creator) {
      next(createHttpError(400, " You are already a creator!"));
    } else {
      const newItem1 = new ItemsSchema({
        title: "Landscape printed picture",
        price: 10,
        description:
          "Landscape printed picture of selected post with ratio: 16:9",
        quantity: 99,
        sellerId: req.user._id,
        imgRatio: "16/9",
      });
      const newItem2 = new ItemsSchema({
        title: "Portret printed picture",
        price: 10,
        description: "Portret printed picture of selected post with ratio: 3:4",
        quantity: 99,
        sellerId: req.user._id,
        imgRatio: "3/4",
      });
      await newItem1.save();
      await newItem2.save();
      //
      const creator = new CreatorSchema({
        ...req.body,
        shop: { items: [newItem1._id, newItem2._id] },
      });
      await creator.save();
      userInfo!.creator = creator._id;
      await userInfo!.save();
      res.send(userInfo);
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
        req.user.creator,
      );
      if (creator) {
        creator.shop.items.map(
          async (I: any) => await ItemsSchema.findByIdAndDelete(I._id),
        );
        //
        await CreatorSchema.findOneAndDelete(req.user.creator);
        //
        const user = await UserSchema.findByIdAndUpdate(
          req.user._id,
          {
            creator: null,
          },
          { new: true },
        );
        res.send(user);
      } else {
        next(createHttpError(404, "You are not creator!"));
      }
    } catch (error) {
      console.log(500);
      next(createHttpError(500, error as any));
    }
  },
);

export default creatorRoute;
