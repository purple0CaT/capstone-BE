import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CommentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: {
      _id: { type: Object },
      firstname: { type: String },
      lastname: { type: String },
      avatar: { type: String },
    },
  },
  { timestamps: true }
);

export default model("Comment", CommentSchema);
