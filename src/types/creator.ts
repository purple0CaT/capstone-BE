import { ObjectId } from "mongoose";

export interface CreatorType {
  _id: string;
  creatorType: string;
  shop: string;
  booking: {
    appointments: ObjectId[];
    availability: { start: Date; end: Date }[];
  };
}
