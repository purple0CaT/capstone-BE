import createHttpError from "http-errors";
import BookingSchema from "./schema";
import CreatorSchema from "./../creator/schema";
//
export const checkFreeDays = async (req: any) => {
  try {
    const availabilityCheck = await CreatorSchema.findById(
      req.params.creatorId
    );
    const checkAppoint = availabilityCheck!.booking.availability.some(
      (A) =>
        A.start <= new Date(req.body.appointmentDate) &&
        A.end >= new Date(req.body.appointmentDate)
    );
    //==============
    const bookingsData = await Promise.all(
      availabilityCheck!.booking.appointments.map(
        async (AP) => await BookingSchema.findById(AP)
      )
    );
    const checkBookings = bookingsData.some(
      (d) =>
        d.appointmentDate <= new Date(req.body.appointmentDate) &&
        d.appointmentDate.setHours(d.appointmentDate.getHours() + 1) >=
          new Date(req.body.appointmentDate)
    );
    return { checkAppoint, checkBookings };
  } catch (error) {
    throw createHttpError(500, error as Error);
  }
};
