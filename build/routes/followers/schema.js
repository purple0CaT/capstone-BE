"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema, model } = mongoose_1.default;
const FollowSchema = new Schema({
    followers: [
        {
            _id: { type: Object },
            firstname: { type: String },
            lastname: { type: String },
            avatar: { type: String },
        },
    ],
    youFollow: [
        {
            _id: { type: Object },
            firstname: { type: String },
            lastname: { type: String },
            avatar: { type: String },
        },
    ],
});
exports.default = model("Follower", FollowSchema);
