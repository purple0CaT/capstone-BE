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
exports.ioAuthorization = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const token_1 = require("../../routes/auth/tokens/token");
const schema_1 = __importDefault(require("../../routes/users/schema"));
const ioAuthorization = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = socket.handshake.auth.accessToken;
        // const requestForm = cookie.parse(socket.handshake.headers.cookie);
        // const accessToken = socket.handshake.headers.auth;
        if (accessToken) {
            const { _id } = (yield (0, token_1.verifyJWT)(accessToken));
            const user = yield schema_1.default.findById(_id);
            // console.log(user);
            if (user) {
                user.socket = socket.id;
                yield user.save();
                socket.user = user;
                // console.log(socket.user);
                next();
            }
            else {
                next((0, http_errors_1.default)(404, { message: "User not found!" }));
            }
        }
        else {
            next((0, http_errors_1.default)(400, { message: "Provide Access Token!" }));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
});
exports.ioAuthorization = ioAuthorization;
