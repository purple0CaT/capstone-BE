import mongoose from "mongoose";
const { Schema, model } = mongoose;
//
const OrderSchema = new Schema({
  items: [{ type: Object, required: true }],
  totalCost: { type: Number, required: true },
  customerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  paid: { type: Boolean, default: false },
  deliveryCode: { type: String, default: null },
  completed: { true: String },
});

export default model("Order", OrderSchema);
