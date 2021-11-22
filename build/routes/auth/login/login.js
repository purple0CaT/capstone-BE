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
const passport_1 = __importDefault(require("passport"));
const schema_1 = __importDefault(require("../../users/schema"));
const token_1 = require("../tokens/token");
process.env.TS_NODE_DEV && require("dotenv").config();
const loginRoute = express_1.default.Router();
loginRoute.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield schema_1.default.CheckCredentials(email, password);
        if (user) {
            const { accessToken, refreshToken } = yield (0, token_1.generateJWT)(user);
            user.refreshToken = refreshToken;
            yield user.save();
            res.send({ user, tokens: { accessToken, refreshToken } });
        }
        else {
            next((0, http_errors_1.default)(400, "Bad request"));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
//
loginRoute.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
loginRoute.get("/googleRed", passport_1.default.authenticate("google"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send({ user: req.user.user, tokens: req.user.tokens });
        res.redirect(`${process.env.URL}`);
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
exports.default = loginRoute;
