"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandlers_1 = require("./errorHandler/errorHandlers");
const register_1 = __importDefault(require("./routes/auth/register/register"));
const login_1 = __importDefault(require("./routes/auth/login/login"));
const user_1 = __importDefault(require("./routes/users/user"));
const passport_1 = __importDefault(require("passport"));
const loginGoogle_1 = __importDefault(require("./routes/auth/login/loginGoogle"));
const post_1 = __importDefault(require("./routes/posts/post"));
const followers_1 = __importDefault(require("./routes/followers/followers"));
const chat_1 = __importDefault(require("./routes/chats/chat"));
const creator_1 = __importDefault(require("./routes/creator/creator"));
const shop_1 = __importDefault(require("./routes/shop/shop"));
const order_1 = __importDefault(require("./routes/order/order"));
const booking_1 = __importDefault(require("./routes/booking/booking"));
const comment_1 = __importDefault(require("./routes/posts/comments/comment"));
//
exports.app = (0, express_1.default)();
passport_1.default.use(loginGoogle_1.default);
//
exports.app.use((0, cors_1.default)({ origin: [process.env.CLIENT_URL, process.env.URL] }));
exports.app.use(express_1.default.json());
exports.app.use(passport_1.default.initialize());
//
exports.app.use("/register", register_1.default);
exports.app.use("/login", login_1.default);
exports.app.use("/user", user_1.default);
exports.app.use("/post", post_1.default);
exports.app.use("/creator", creator_1.default);
exports.app.use("/comments", comment_1.default);
exports.app.use("/chat", chat_1.default);
exports.app.use("/follow", followers_1.default);
exports.app.use("/shop", shop_1.default);
exports.app.use("/order", order_1.default);
exports.app.use("/booking", booking_1.default);
//
exports.app.use(errorHandlers_1.generalErrHandl);
exports.app.use(errorHandlers_1.catchAllHandler);
