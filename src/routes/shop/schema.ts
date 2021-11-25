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
  title: { type: String },
  descrition: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  seller: { Type: String, required: false },
});
export const ItemsSchema = model("Items", Items);
//=== SHOP
// const Shop = new Schema({
//   items: [{ type: Object, required: false }],
//   orders: [{ type: Object, required: false }],
//   deliverOrder: [{ type: Object, required: false }],
//   pendingOrder: [{ type: Object, required: false }],
// });
// export const ShopSchema = model("Shop", Shop);
