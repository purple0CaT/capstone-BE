"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const FollowSchema = new Schema({
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    youFollow: [{ type: Schema.Types.ObjectId, ref: "User" }],
});
exports.default = model("Follower", FollowSchema);
