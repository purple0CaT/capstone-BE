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
const cloudinary_1 = require("cloudinary");
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const tokenCheck_1 = require("../../middlewares/authorization/tokenCheck");
const schema_1 = __importDefault(require("../users/schema"));
const schema_2 = __importDefault(require("./schema"));
//
const ObjectId = mongoose_1.default.Types.ObjectId;
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            folder: "sandoraw-chats",
        };
    }),
});
//
const chatRoute = express_1.default.Router();
chatRoute.get("/single/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield schema_2.default.findById(req.params.chatId);
        if (chat) {
            res.send(chat);
        }
        else {
            next((0, http_errors_1.default)(404, "Chat not found!"));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.get("/userChats", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allChats = yield schema_2.default.find({
            "members._id": req.user._id,
        }).sort("-updatedAt");
        if (allChats) {
            res.send(allChats);
        }
        else {
            next((0, http_errors_1.default)(404, "Chat not found!"));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.delete("/single/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield schema_2.default.findByIdAndDelete(req.params.chatId);
    // console.log(chat);
    res.status(204).send({ message: "Deleted!" });
}));
//
chatRoute.put("/single/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield schema_2.default.findByIdAndUpdate(req.params.chatId, req.body, { new: true });
        res.send(chat);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.put("/image/:chatId", (0, multer_1.default)({ storage: storage }).single("media"), tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield schema_2.default.findByIdAndUpdate(req.params.chatId, req.body, { new: true });
        res.send(chat);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
//
chatRoute.post("/createChat/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const addedUser = yield schema_1.default.findById(req.params.userId);
        const checkCreatedChat = yield schema_2.default.find({
            $and: [
                { "members._id": req.user._id },
                { "members._id": new ObjectId(req.params.userId) },
            ],
        });
        if (checkCreatedChat.length === 0) {
            const membersArray = [
                {
                    _id: req.user._id,
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    avatar: req.user.avatar,
                },
                {
                    _id: new ObjectId(addedUser._id),
                    firstname: addedUser.firstname,
                    lastname: addedUser.lastname,
                    avatar: addedUser.avatar,
                },
            ];
            const newChat = new schema_2.default(Object.assign(Object.assign({}, req.body), { members: membersArray }));
            yield newChat.save();
            const allChats = yield schema_2.default.find({
                "members._id": req.user._id,
            }).sort("-updatedAt");
            res.send({ newChat, allChats });
        }
        else {
            next((0, http_errors_1.default)(400, "Chat already created"));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.post("/addUser/:userId/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(req.user);
    try {
        const addedUser = yield schema_1.default.findById(req.params.userId);
        const chat = yield schema_2.default.findByIdAndUpdate(req.params.chatId, {
            $push: {
                members: {
                    _id: addedUser._id,
                    firstname: addedUser.firstname,
                    lastname: addedUser.lastname,
                    avatar: addedUser.avatar,
                },
            },
        }, { new: true });
        const allChats = yield schema_2.default.find({
            "members._id": req.user._id,
        }).sort("-updatedAt");
        res.send({ chat, allChats });
    }
    catch (error) {
        // console.log(error)
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.delete("/deleteUser/:userId/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Mychat = yield schema_2.default.findByIdAndUpdate(req.params.chatId, {
            $pull: { members: { _id: new ObjectId(req.params.userId) } },
        }, { new: true });
        const Chats = yield schema_2.default.find({
            "members._id": req.user._id,
        }).sort("-updatedAt");
        res.send({ chat: Mychat, allChats: Chats });
    }
    catch (error) {
        // console.log(error);
        next((0, http_errors_1.default)(500, error));
    }
}));
chatRoute.delete("/deleteChat/:chatId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const delChat = yield schema_2.default.findByIdAndDelete(req.params.chatId);
        const allChats = yield schema_2.default.find({
            "members._id": req.user._id,
        }).sort("-updatedAt");
        res.send({ chat: allChats[0], allChats });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = chatRoute;
