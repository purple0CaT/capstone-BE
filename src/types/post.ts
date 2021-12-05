import { ObjectId } from "mongoose";

export interface PostType {
  text: string;
  media: string;
  author: {
    _id: ObjectId;
    firstname: string;
    lastname: string;
    avatar: string;
  };
  location?: string;
  createdAt: string;
  updatedAt: string;
  likes?: string;
  comments?: [];
}
