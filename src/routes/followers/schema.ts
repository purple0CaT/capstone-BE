import mongoose from "mongoose";
const { Schema, model } = mongoose;
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

export default model("Follower", FollowSchema);
