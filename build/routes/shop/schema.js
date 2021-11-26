"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//
const { Schema, model } = mongoose_1.default;
//=== ITEMS
const Items = new Schema({
    image: {
        type: String,
        required: false,
        default: "https://www.bevi.com/static/files/0/ecommerce-default-product.png",
    },
    title: { type: String },
    descrition: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    seller: { Type: String, required: false },
});
exports.ItemsSchema = model("Item", Items);
//=== SHOP
// const Shop = new Schema({
//   items: [{ type: Object, required: false }],
//   orders: [{ type: Object, required: false }],
//   deliverOrder: [{ type: Object, required: false }],
//   pendingOrder: [{ type: Object, required: false }],
// });
// export const ShopSchema = model("Shop", Shop);
