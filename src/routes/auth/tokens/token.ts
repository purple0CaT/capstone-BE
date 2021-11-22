import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { UserType } from "../../../types/user";
import UserSchema from "../../users/schema";
process.env.TS_NODE_DEV && require("dotenv").config();
//
export const generateJWT = async (user: UserType) => {
  const accessToken = await createJWT({ _id: user._id });
  const refreshToken = await createRefreshJWT({ _id: user._id });
  return { accessToken, refreshToken };
};
//  GENERATE TOKENS
const createJWT = (payload: any) =>
  new Promise((res, rej) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    );
  });
const createRefreshJWT = (payload: any) =>
  new Promise((res, rej) => {
    jwt.sign(
      payload,
      process.env.JWT_REFR_SECRET!,
      { expiresIn: "1w" },
      (err, token) => {
        if (err) rej(err);
        else res(token);
      }
    );
  });
// verify token
export const verifyJWT = (token: string) =>
  new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    });
  });
// verify REFRESH token
export const verifyRefreshJWT = (token: string) =>
  new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_REFR_SECRET!, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    });
  });
//  GENERATE TOKENS BASED ON REFRESH TOKEN
export const generateRefreshJWT = async (refToken: string) => {
  const decodToken = await verifyRefreshJWT(refToken);
  const user = await UserSchema.findOne(decodToken as any);
  if (!user) throw createHttpError(404, "User not found!");
  if (user.refreshToken === refToken) {
    const { accessToken, refreshToken } = await generateJWT(user);
    return { accessToken, refreshToken };
  } else {
    throw createHttpError(401, "Token not valid");
  }
};
