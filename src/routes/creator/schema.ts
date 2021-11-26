import mongoose from "mongoose";
import { CreatorType } from "../../types/creator";

const { Schema, model } = mongoose;

const CreatorSchema = new Schema({
  creatorType: { type: String, required: true },
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
  booking: [{ type: Object, default: [] }],
});

export default model<CreatorType>("Creator", CreatorSchema);
