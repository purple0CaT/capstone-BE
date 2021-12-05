"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
//
const BookingSchema = new Schema({
    appointmentDate: { type: Date, required: true, min: new Date() },
    appointmentEnd: { type: Date, required: true, min: new Date() },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    confirmed: { type: Boolean, default: false },
});
exports.default = model("Booking", BookingSchema);
