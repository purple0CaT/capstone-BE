"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const CommentSchema = new Schema({
    text: { type: String, required: true },
    author: {
        _id: { type: Object },
        firstname: { type: String },
        lastname: { type: String },
        avatar: { type: String },
    },
}, { timestamps: true });
exports.default = model("Comment", CommentSchema);
