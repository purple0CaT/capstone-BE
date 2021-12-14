import createHttpError from "http-errors";
import BookingSchema from "./schema";
import CreatorSchema from "./../creator/schema";

// CHECK AVAILABILITY AND APPOINTMENTS
export const checkFreeDays = async (req: any) => {
  try {
    const creator = await CreatorSchema.findById(req.params.creatorId);
    const checkAvailability = creator!.booking.availability.some(
      (Av) =>
        Av.start <= new Date(req.body.appointmentDate) &&
        Av.end >= new Date(req.body.appointmentDate) &&
        Av.start <= new Date(req.body.appointmentEnd) &&
        Av.end >= new Date(req.body.appointmentEnd),
    );
    // console.log(creator!.booking.availability[0].end.toLocaleTimeString());
    // console.log(new Date(req.body.appointmentEnd).toLocaleTimeString());
    // console.log(creator!.booking.availability[0].end < new Date(req.body.appointmentEnd));
    //============== Availability Checks
    const bookingsData = await Promise.all(
      creator!.booking.appointments.map(
        async (AP) => await BookingSchema.findById(AP),
      ),
    );
    const checkBookings = bookingsData.some(
      (d) =>
        d.appointmentDate <= new Date(req.body.appointmentDate) &&
        d.appointmentDate.setHours(d.appointmentDate.getHours() + 1) >=
          new Date(req.body.appointmentDate),
    );
    // ===
    return { checkAvailability, checkBookings };
  } catch (error) {
    throw createHttpError(500, error as Error);
  }
};
//  Check only availability
export const checkAvailability = async (req: any) => {
  try {
    const creatorAvailabil = await CreatorSchema.findById(req.user.creator);
    const checkIt = creatorAvailabil!.booking.availability.some(
      (A) =>
        A.start <= new Date(req.body.start) &&
        A.end >= new Date(req.body.start) &&
        A.start <= new Date(req.body.end) &&
        A.end >= new Date(req.body.end),
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
        (A) => A.end >= new Date(),
      );
      creator.booking.availability = filtered;
      await creator.save();
    }
  } catch (error) {
    throw createHttpError(500, error as Error);
  }
};
// ==============
export const checkEmptyAvail = (app: any, avail: any) => {
  // const availebelApps = avail.map((AV: any) => {
  //   if(AV.start<=app.)
  // });
  const test: any = [];
  for (let av = 0; av < avail.length; av++) {
    for (let ap = 0; ap < app.length; ap++) {
      if (
        avail[av].start <= app[ap].appointmentDate &&
        avail[av].end >=
          app[ap].appointmentDate.setHours(
            app[ap].appointmentDate.getHours() + 1,
          ) &&
        avail[av].end >=
          app[ap].appointmentDate.setHours(
            app[ap].appointmentDate.getHours() + 2,
          ) &&
        avail[av].end >=
          app[ap].appointmentDate.setHours(
            app[ap].appointmentDate.getHours() + 2,
          )
      ) {
        test.push(avail[av]);
      }
    }
  }
  const duplicate = Array.from(new Set(test));
  console.log(duplicate);
  const testCheck = avail[0].start <= app[0].appointmentDate;
  const availArr = avail.filter((A: any) => !duplicate.includes(A));
  // console.log("appointments ======>", app);
  console.log("AVAILABILITY ======>", avail);
  console.log(availArr);
  // console.log(avail);
  // console.log(duplicate);
};
