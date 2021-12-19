import { NextFunction } from "express";
import createHttpError from "http-errors";
import { verifyJWT } from "../../routes/auth/tokens/token";
import UserSchema from "../../routes/users/schema";

export const authJWT = async (req: any, res: any, next: NextFunction) => {
  if (!req.headers.authorization) {
    next(createHttpError(401, "Provide credentials"));
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const decodeToken: any = await verifyJWT(token);
      const user = await UserSchema.findById(decodeToken._id).populate({
        path: "shopping.orders",
      });
      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, "User not found!"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(501, "Relogin"));
    }
  }
};
