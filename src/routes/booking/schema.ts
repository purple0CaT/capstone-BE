import mongoose from "mongoose";
const { Schema, model } = mongoose;
//
const BookingSchema = new Schema({
  appointmentDate: { type: Date, required: true, min: new Date() },
  appointmentEnd: { type: Date, required: true, min: new Date() },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  confirmed: { type: Boolean, default: false },
});

export default model("Booking", BookingSchema);
