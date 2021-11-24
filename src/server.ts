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
//
export const app = express();
passport.use(googleStrategy);
//
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
//
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/follow", followRoute);
app.use("/chat", chatRoute);
//
app.use(generalErrHandl as any);
app.use(catchAllHandler as any);
