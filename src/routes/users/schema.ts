import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserSchemaType, UserType } from "../../types/user";
//
const { Schema, model } = mongoose;
//
const UserSchema = new Schema<UserType, UserSchemaType>({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: {
    type: String,
    required: function (this: any) {
      return !Boolean(this.fbId || this.googleId);
    },
  },
  email: { type: String, required: true },
  avatar: {
    type: String,
    required: false,
    default:
      "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
  },
  googleId: {
    type: String,
    required: function (this: any) {
      return !Boolean(this.fbId || this.password);
    },
  },
  fbId: {
    type: String,
    required: function (this: any) {
      return !Boolean(this.googleId || this.password);
    },
  },
  socket: { type: String, required: false },
  cart: { type: String, required: false },
  creator: { type: String, required: false },
  refreshToken: { type: String, required: false },
});
//
UserSchema.pre("save", async function () {
  const user = this;
  const pass = user.password;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(pass as any, 10);
  }
});
//
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;
  delete userObj.refreshToken;
  return userObj;
};
//
UserSchema.statics.CheckCredentials = async function (email, pass) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(pass, user.password as any);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model<UserType, UserSchemaType>("User", UserSchema);
