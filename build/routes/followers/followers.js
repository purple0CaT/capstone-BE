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
const express_1 = __importDefault(require("express"));
const tokenCheck_1 = require("../../middlewares/authorization/tokenCheck");
const schema_1 = __importDefault(require("../users/schema"));
const schema_2 = __importDefault(require("../followers/schema"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
//
const ObjectId = mongoose_1.default.Types.ObjectId;
//
const followRoute = express_1.default.Router();
// Follow smbdy
followRoute.post("/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //
        const myUser = yield schema_1.default.findById(req.user._id.toString());
        const followedUser = yield schema_1.default.findById(req.params.userId);
        yield schema_2.default.findByIdAndUpdate(myUser.followers.toString(), {
            $push: {
                youFollow: followedUser._id,
            },
        });
        yield schema_2.default.findByIdAndUpdate(followedUser.followers.toString(), {
            $push: {
                followers: req.user._id,
            },
        });
        res.send(myUser);
    }
    catch (error) {
        console.log(error);
        next((0, http_errors_1.default)(500, error));
    }
}));
// Unfollow smbdy
followRoute.delete("/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myFollowers = yield schema_2.default.findByIdAndUpdate(req.user.followers, { $pull: { youFollow: new ObjectId(req.params.userId) } }, { new: true });
        const followedUser = yield schema_1.default.findById(req.params.userId);
        yield schema_2.default.findByIdAndUpdate(followedUser === null || followedUser === void 0 ? void 0 : followedUser.followers, {
            $pull: { followers: req.user._id },
        });
        res.send(myFollowers);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = followRoute;
