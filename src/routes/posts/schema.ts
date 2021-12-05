import mongoose from "mongoose";
import { PostType } from "../../types/post";
//
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    text: { type: String, required: true },
    media: { type: String, required: true },
    author: { type: Object, required: true },
    likes: [{ type: String, required: false }],
    location: { type: String, required: false },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export default model<PostType>("Post", PostSchema);
