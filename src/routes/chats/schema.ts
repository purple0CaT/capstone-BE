import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const MessageSchema = new Schema(
  {
    sender: { type: Object, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);
const ChatSchema = new Schema(
  {
    name: { type: String, required: false, default: "Some chat" },
    image: {
      type: String,
      default:
        "https://p.kindpng.com/picc/s/262-2620686_ottawa-city-landscape-city-landscape-png-transparent-png.png",
    },
    members: [{ type: Object }],
    history: [{ type: MessageSchema, required: false }],
  },
  {
    timestamps: true,
  },
);

export default model("Chat", ChatSchema);
