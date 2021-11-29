import mongoose from "mongoose";
import { CreatorType } from "../../types/creator";

const { Schema, model } = mongoose;

const CreatorSchema = new Schema({
  creatorType: { type: String, required: true, enum: ["Photographer"] },
  shop: {
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: false,
        default: [],
      },
    ],
    orders: [{ type: Schema.Types.ObjectId, ref: "Order", default: [] }],
  },
  booking: {
    appointments: [
      { type: Schema.Types.ObjectId, ref: "Booking", default: [] },
    ],
    availability: [
      {
        start: { type: Date, required: true, min: new Date() },
        end: { type: Date, required: true },
      },
    ],
  },
});

export default model<CreatorType>("Creator", CreatorSchema);
