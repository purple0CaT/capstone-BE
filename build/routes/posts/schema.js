"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//
const { Schema, model } = mongoose_1.default;
const PostSchema = new Schema({
    text: { type: String, required: true },
    media: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: String, required: false }],
    location: { type: String, required: false },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });
exports.default = model("Post", PostSchema);
