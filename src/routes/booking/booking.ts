import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import BookingSchema from "./schema";
import CreatorSchema from "./../creator/schema";
import { creatorAuth } from "../../middlewares/creator/creator";
import UserSchema from "../users/schema";
import { checkFreeDays } from "./utility";
//
const bookingRoute = express.Router();
//
bookingRoute.get("/creator/:creatorId", authJWT, async (req, res, next) => {
  try {
    const appointments = await BookingSchema.findById(
      req.params.creatorId
    ).populate("booking");
    res.send(appointments);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
bookingRoute.post(
  "/createAppoint/:creatorId",
  authJWT,
  async (req: any, res, next) => {
    try {
      const { checkAppoint, checkBookings } = await checkFreeDays(req);
      if (checkAppoint && !checkBookings) {
        //
        const newAppointment = new BookingSchema({
          ...req.body,
          user: req.user._id,
        });
        await newAppointment.save();
        //
        const user = await UserSchema.findByIdAndUpdate(req.user._id, {
          $push: { booking: newAppointment._id },
        });
        //
        const creator = await CreatorSchema.findByIdAndUpdate(
          req.params.creatorId,
          { $push: { "booking.appointments": newAppointment._id } },
          { new: true }
        );
        res.send({ creator, newAppointment });
      } else {
        next(createHttpError(400, "This date's booked or not avaible"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(500, error as Error));
    }
  }
);
bookingRoute.get("/appointment/:bookingId", authJWT, async (req, res, next) => {
  try {
    const specific = await BookingSchema.findById(req.params.bookingId);
    res.send(specific);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
// bookingRoute.post(
//   "/appointment/:bookingId",
//   authJWT,
//   async (req, res, next) => {
//     try {
//       const specific = await BookingSchema.findByIdAndUpdate(
//         req.params.bookingId,
//         req.body,
//         { new: true }
//       );
//       res.send(specific);
//     } catch (error) {
//       next(createHttpError(500, error as Error));
//     }
//   }
// );
bookingRoute.post(
  "/setavailability",
  authJWT,
  creatorAuth,
  async (req: any, res, next) => {
    try {
      //
      const creator = await CreatorSchema.findByIdAndUpdate(
        req.user.creator,
        { $push: { "booking.availability": req.body } },
        { new: true }
      );
      res.send(creator);
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  }
);
export default bookingRoute;
