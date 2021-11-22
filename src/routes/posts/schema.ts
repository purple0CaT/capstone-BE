import mongoose from "mongoose";
import { PostType } from "../../types/post";
//
const { Schema, model } = mongoose;

const PostSchema = new Schema<PostType>(
  {
    text: { type: String, required: true },
    media: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    location: [{ type: String, required: false }],
    likes: [{ type: String, required: false }],
    comments: [],
  },
  { timestamps: true }
);

export default model<PostType>("Post", PostSchema);
