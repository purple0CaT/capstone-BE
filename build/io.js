"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const socket_io_1 = require("socket.io");
const server_1 = require("./server");
const http_1 = require("http");
//
exports.httpServer = (0, http_1.createServer)(server_1.app);
const io = new socket_io_1.Server(exports.httpServer, { allowEIO3: true });
//
// io.use
