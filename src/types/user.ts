import { Model } from "mongoose";

export interface UserIdType {
  _id: string;
}
export interface UserType {
  firstname: string;
  lastname: string;
  email: string;
  avatar: string;
  _id: string;
  password?: string;
  googleId?: string;
  fbId?: string;
  refreshToken?: any;
  socket?: string;
  cart?: string;
  shop?: string;
  creator?: string;
  booking?: string;
}
export interface UserSchemaType extends Model<UserType> {
  CheckCredentials(email: string, password: string): any;
}
