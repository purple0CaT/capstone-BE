import { NextFunction } from "express";
import createHttpError from "http-errors";

export const creatorAuth = async (req: any, res: any, next: NextFunction) => {
  try {
    if (req.user.creator) {
      next();
    } else {
      next(createHttpError(404, "You are not a creator!"));
    }
  } catch (error) {
    next(createHttpError(500, error as any));
  }
};
