import mongoose from "mongoose";
import { PostType } from "../../types/post";

//
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    text: { type: String, required: true },
    media: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: String, required: false }],
    location: {
      title: { type: String, required: false },
      cord: [{ type: String, required: false }],
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true },
);

export default model<PostType>("Post", PostSchema);
