"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
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
exports.default = model("Creator", CreatorSchema);
