import { NextFunction } from "express";
import { HttpError } from "http-errors";

export const generalErrHandl = (
  err: HttpError,
  req: HttpError,
  res: any,
  next: NextFunction
) => {
  if (err.status >= 400 && err.status < 500) {
    res.status(err.status).send({
      status: "error",
      message: err.message || "Error!",
    });
  } else {
    next(err);
  }
};

export const catchAllHandler = (
  err: HttpError,
  req: HttpError,
  res: any,
  next: NextFunction
) => {
  console.log(err);
  res.status(500).send({ status: "error", message: "Generic Server Error" });
};
