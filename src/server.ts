import express from "express";
import cors from "cors";
import { generalErrHandl, catchAllHandler } from "./errorHandler/errorHandlers";
import registerRoute from "./routes/auth/register/register";
import loginRoute from "./routes/auth/login/login";
import userRoute from "./routes/users/user";
//
export const app = express();
//
app.use(cors());
app.use(express.json());
//
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/user", userRoute);
//
app.use(generalErrHandl as any);
app.use(catchAllHandler as any);
