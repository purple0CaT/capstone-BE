import { NextFunction } from "express";
import createHttpError from "http-errors";

export const adminCheck = async (req: any, res: any, next: NextFunction) => {
  try {
    if (req.user.type === "admin") {
      next();
    } else {
      next(createHttpError(404, "You are not allowed!"));
    }
  } catch (error) {
    next(createHttpError(500, error as any));
  }
};
