import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const MessageSchema = new Schema(
  {
    sender: { type: Object, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);
const ChatSchema = new Schema({
  name: { type: String, required: false, default: "Some chat" },
  image: { type: String },
  members: [{ type: Object }],
  history: [{ type: MessageSchema, required: false }],
});

export default model("Chat", ChatSchema);
