import express from "express";
import createHttpError from "http-errors";
import { authJWT } from "../../middlewares/authorization/tokenCheck";
import BookingSchema from "./schema";
import CreatorSchema from "./../creator/schema";
import { creatorAuth } from "../../middlewares/creator/creator";
import UserSchema from "../users/schema";
import {
  checkAvailability,
  checkEmptyAvail,
  checkFreeDays,
  clearAppointments,
} from "./utility";
import { CreatorType } from "../../types/creator";
//
const bookingRoute = express.Router();
//
// bookingRoute.get("/creator/:creatorId", authJWT, async (req, res, next) => {
//   try {
//     const appointments = await CreatorSchema.findById(
//       req.params.creatorId
//     ).populate("booking.appointments");
//     res.send(appointments);
//   } catch (error) {
//     next(createHttpError(500, error as Error));
//   }
// });
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
          { new: true },
        );
        res.send({ creator, newAppointment });
      } else {
        next(createHttpError(400, "This date's booked or not avaible"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(500, error as Error));
    }
  },
);
bookingRoute.get("/appointment/:bookingId", authJWT, async (req, res, next) => {
  try {
    const specific = await BookingSchema.findById(req.params.bookingId);
    res.send(specific);
  } catch (error) {
    next(createHttpError(500, error as Error));
  }
});
bookingRoute.get(
  "/freeappointments/:creatorId",
  authJWT,
  async (req, res, next) => {
    try {
      const creator: any = await CreatorSchema.findById(req.params.creatorId);
      const allApp = await Promise.all(
        creator.booking.appointments.map(
          async (A: string) => await BookingSchema.findById(A),
        ),
      );
      const availability = creator.booking.availability;
      const checkEmptyAvailability = checkEmptyAvail(allApp, availability);
      // console.log(availability);
      // console.log(allApp);
      // console.log(allOne);
      res.send({ availability: checkEmptyAvailability });
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);
bookingRoute.post(
  "/setavailability",
  authJWT,
  creatorAuth,
  async (req: any, res, next) => {
    try {
      const checkAvail = await checkAvailability(req);
      // clearAppointments(req);
      if (checkAvail) {
        const creator = await CreatorSchema.findByIdAndUpdate(
          req.user.creator,
          {
            $push: {
              "booking.availability": req.body,
            },
          },
          { new: true },
        );
        res.send(creator);
      } else {
        next(
          createHttpError(
            400,
            "Availability already set for this time, pick another one!",
          ),
        );
      }
    } catch (error) {
      next(createHttpError(500, error as Error));
    }
  },
);
export default bookingRoute;
