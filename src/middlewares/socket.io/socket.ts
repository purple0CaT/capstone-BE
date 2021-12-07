import { NextFunction } from "express";
import createHttpError from "http-errors";
import { Socket } from "socket.io";
import { verifyJWT } from "../../routes/auth/tokens/token";
import UserSchema from "../../routes/users/schema";

export const ioAuthorization = async (socket: any, next: NextFunction) => {
  try {
    const accessToken = socket.handshake.auth.accessToken;
    // const requestForm = cookie.parse(socket.handshake.headers.cookie);
    // const accessToken = socket.handshake.headers.auth;
    if (accessToken) {
      const { _id } = (await verifyJWT(accessToken)) as any;
      const user = await UserSchema.findById(_id);
      // console.log(user);
      if (user) {
        user.socket = socket.id;
        await user.save();
        socket.user = user;
        // console.log(socket.user);
        next();
      } else {
        next(createHttpError(404, { message: "User not found!" }));
      }
    } else {
      next(createHttpError(400, { message: "Provide Access Token!" }));
    }
  } catch (error) {
    next(createHttpError(500, error as any));
  }
};
