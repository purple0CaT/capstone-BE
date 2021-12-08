"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const socket_io_1 = require("socket.io");
const server_1 = require("./server");
const http_1 = require("http");
const socket_1 = require("./middlewares/socket.io/socket");
const schema_1 = __importDefault(require("./routes/chats/schema"));
const models_1 = __importDefault(require("./routes/chats/models"));
const schema_2 = __importDefault(require("./routes/users/schema"));
//
exports.httpServer = (0, http_1.createServer)(server_1.app);
const io = new socket_io_1.Server(exports.httpServer, { allowEIO3: true });
//
io.use(socket_1.ioAuthorization);
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield schema_1.default.find({
        "members._id": socket.user._id,
    });
    chats.map((chat) => {
        socket.join(chat._id.toString());
    });
    // ======================
    socket.on("sendmessage", ({ message, room }) => __awaiter(void 0, void 0, void 0, function* () {
        const newMessage = new models_1.default({
            sender: {
                _id: socket.user._id,
                firstname: socket.user.firstname,
                lastname: socket.user.lastname,
                avatar: socket.user.avatar,
            },
            message: message,
        });
        const chatHistory = yield schema_1.default.findByIdAndUpdate(room, {
            $push: { history: newMessage },
        }, { new: true });
        const allChats = yield schema_1.default.find({
            "members._id": socket.user._id,
        }).sort("-updatedAt");
        io.in(room).emit("message", { chatHistory, allChats });
    }));
    //========
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        // console.log("disconnected socket " + socket.id);
        const user = yield schema_2.default.findById(socket.user._id);
        user.socket = null;
        yield user.save();
    }));
}));
