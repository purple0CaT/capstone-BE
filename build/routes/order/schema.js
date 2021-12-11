"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
//
const OrderSchema = new Schema({
    items: [{ type: Object, required: true }],
    totalCost: { type: Number, required: true },
    customerId: { type: String, required: true },
    // sellerId: { type: String, required: true },
    paid: { type: Boolean, default: false },
    deliveryCodeTracking: { type: String, default: null },
    deliveryAddress: { type: String, required: true },
    completed: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = model("Order", OrderSchema);
