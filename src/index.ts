import mongoose from "mongoose";
import { httpServer } from "./io";
import listEndpoints from "express-list-endpoints";
process.env.TS_NODE_DEV && require("dotenv").config();
//
const port = process.env.PORT || 3003;
//
if (!process.env.MONGO_URL) {
  throw new Error("No MongoDB uri defined");
}
//
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Connected to Mongo🍁");
  console.table(listEndpoints(httpServer as any));
  httpServer.listen(port);
});
