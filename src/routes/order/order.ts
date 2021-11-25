import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import { creatorAuth } from "../../middlewares/creator/creator";
import OrderSchema from "./schema";
//
const orderRoute = express.Router();
//
orderRoute.get("/", authJWT, creatorAuth, async (req: any, res, next) => {
  try {
    const orders = await OrderSchema.find();
    res.send(orders);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
export default orderRoute