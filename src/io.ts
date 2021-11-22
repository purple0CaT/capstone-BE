import { Server } from "socket.io";
import { app } from "./server";
import { createServer } from "http";
//
export const httpServer = createServer(app);
const io = new Server(httpServer, { allowEIO3: true });
// 
io.use