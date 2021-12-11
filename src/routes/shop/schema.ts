import mongoose from "mongoose";
//
const { Schema, model } = mongoose;
//=== ITEMS
const Items = new Schema({
  image: {
    type: String,
    required: false,
    default:
      "https://www.bevi.com/static/files/0/ecommerce-default-product.png",
  },
  sellerId: { type: String, required: true },
  title: { type: String },
  imgRatio: { type: String },
  completed: { type: Boolean, default: "false" },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["default", "user"], default: "default" },
});
export const ItemsSchema = model("Item", Items);
//=== SHOP
// const Shop = new Schema({
//   items: [{ type: Object, required: false }],
//   orders: [{ type: Object, required: false }],
//   deliverOrder: [{ type: Object, required: false }],
//   pendingOrder: [{ type: Object, required: false }],
// });
// export const ShopSchema = model("Shop", Shop);
