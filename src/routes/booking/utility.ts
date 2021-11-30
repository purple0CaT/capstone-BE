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

export const checkAvailability = async (req: any) => {
  try {
    const creatorAvailabil = await CreatorSchema.findById(req.user.creator);
    const checkIt = creatorAvailabil!.booking.availability.some(
      (A) =>
        A.start <= new Date(req.body.start) &&
        A.end >= new Date(req.body.start) &&
        A.start <= new Date(req.body.end) &&
        A.end >= new Date(req.body.end)
    );
    return !checkIt;
  } catch (error) {
    throw createHttpError(500, error as Error);
  }
};

export const clearAppointments = async (req: any) => {
  try {
    const creator = await CreatorSchema.findById(req.user.creator);

    // Promise.all(
    //   filtered.map(
    //     async (F) =>
    //       await CreatorSchema.findByIdAndUpdate(req.user.creator, {
    //         $pop: { "booking.availability": F },
    //       })
    //   )
    // );
    if (creator) {
      const filtered = creator!.booking.availability.filter(
        (A) => A.end >= new Date()
      );
      creator.booking.availability = filtered;
      await creator.save();
    }
  } catch (error) {
    throw createHttpError(500, error as Error);
  }
};
