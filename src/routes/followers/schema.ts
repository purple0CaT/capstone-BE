import mongoose from "mongoose";
const { Schema, model } = mongoose;
const FollowSchema = new Schema({
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  youFollow: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export default model("Follower", FollowSchema);
