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
const http_errors_1 = __importDefault(require("http-errors"));
const schema_1 = __importDefault(require("../../users/schema"));
const token_1 = require("../tokens/token");
const schema_2 = __importDefault(require("./../../followers/schema"));
const registerRoute = express_1.default.Router();
//
registerRoute.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkEmail = yield schema_1.default.findOne({ email: req.body.email });
        if (checkEmail)
            next((0, http_errors_1.default)(401, "Email already exists!"));
        //
        const UserFollowers = new schema_2.default({
            youFollow: [],
            followers: [],
        });
        yield UserFollowers.save();
        //
        const newUser = new schema_1.default(req.body);
        const { accessToken, refreshToken } = yield (0, token_1.generateJWT)(newUser);
        newUser.refreshToken = refreshToken;
        newUser.followers = UserFollowers._id;
        yield newUser.save();
        res
            .status(201)
            .send({ user: newUser, tokens: { accessToken, refreshToken } });
    }
    catch (error) {
        console.log(error);
        next((0, http_errors_1.default)(400, "Fill all fields"));
    }
}));
exports.default = registerRoute;
