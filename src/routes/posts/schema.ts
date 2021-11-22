import mongoose from "mongoose";
//
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    text: { type: String, required: true },
    media: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    location: [{ type: String, required: false }],
  },
  { timestamps: true }
);

export default model("Post", PostSchema);
