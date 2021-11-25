import mongoose from "mongoose";
import { CreatorType } from "../../types/creator";

const { Schema, model } = mongoose;

const CreatorSchema = new Schema({
  creatorType: { type: String, required: true },
  shop: { type: Schema.Types.ObjectId, ref: "Shop" },
  //   statistic: { type: String, ref: "Shop" },
  booking: [{ type: Date, default: [] }],
  pendingBooking: [{ type: Date, default: [] }],
});

export default model<CreatorType>("Creator", CreatorSchema);
