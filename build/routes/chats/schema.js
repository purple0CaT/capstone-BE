"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
exports.MessageSchema = new Schema({
    sender: { type: Object, required: true },
    message: { type: String, required: true },
}, { timestamps: true });
const ChatSchema = new Schema({
    name: { type: String, required: false, default: "Some chat" },
    image: {
        type: String,
        default: "https://p.kindpng.com/picc/s/262-2620686_ottawa-city-landscape-city-landscape-png-transparent-png.png",
    },
    members: [{ type: Object }],
    history: [{ type: exports.MessageSchema, required: false }],
}, {
    timestamps: true,
});
exports.default = model("Chat", ChatSchema);
