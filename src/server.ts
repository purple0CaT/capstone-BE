import express from "express";
import cors from "cors";
import { generalErrHandl, catchAllHandler } from "./errorHandler/errorHandlers";
import registerRoute from "./routes/auth/register/register";
//
export const app = express();
//
app.use(cors());
app.use(express.json());
//
app.use("/register", registerRoute);
//
app.use(generalErrHandl as any);
app.use(catchAllHandler as any);
