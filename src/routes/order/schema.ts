import mongoose from "mongoose";
const { Schema, model } = mongoose;
//
const OrderSchema = new Schema(
  {
    items: [{ type: Object, required: true }],
    totalCost: { type: Number, required: true },
    customerId: { type: String, required: true },
    // sellerId: { type: String, required: true },
    paid: { type: Boolean, default: false },
    deliveryCodeTracking: { type: String, default: null },
    deliveryAddress: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("Order", OrderSchema);
