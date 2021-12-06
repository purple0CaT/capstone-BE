import express from "express";
import cors from "cors";
import { generalErrHandl, catchAllHandler } from "./errorHandler/errorHandlers";
import registerRoute from "./routes/auth/register/register";
import loginRoute from "./routes/auth/login/login";
import userRoute from "./routes/users/user";
import passport from "passport";
import googleStrategy from "./routes/auth/login/loginGoogle";
import postRoute from "./routes/posts/post";
import followRoute from "./routes/followers/followers";
import chatRoute from "./routes/chats/chat";
import creatorRoute from "./routes/creator/creator";
import shopRoute from "./routes/shop/shop";
import orderRoute from "./routes/order/order";
import bookingRoute from "./routes/booking/booking";
import commentRoute from "./routes/posts/comments/comment";
//
export const app = express();
passport.use(googleStrategy);
//
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(passport.initialize());
//
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/creator", creatorRoute);
app.use("/comments", commentRoute);
app.use("/chat", chatRoute);
app.use("/follow", followRoute);
app.use("/shop", shopRoute);
app.use("/order", orderRoute);
app.use("/booking", bookingRoute);
//
app.use(generalErrHandl as any);
app.use(catchAllHandler as any);
