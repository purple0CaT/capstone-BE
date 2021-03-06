"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const io_1 = require("./io");
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const server_1 = require("./server");
process.env.TS_NODE_DEV && require("dotenv").config();
//
const port = process.env.PORT || 3003;
//
if (!process.env.MONGO_URL) {
    throw new Error("No MongoDB uri defined");
}
//
mongoose_1.default.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to Mongo๐");
    console.table((0, express_list_endpoints_1.default)(server_1.app));
    console.log("Server on ๐", port);
    io_1.httpServer.listen(port);
});
