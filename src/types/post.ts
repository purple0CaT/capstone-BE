import { ObjectId } from "mongoose";

export interface PostType {
  text: string;
  media: string;
  author: Object;
  location?: string;
  createdAt: string;
  updatedAt: string;
  likes?: string;
  comments?: [];
}
