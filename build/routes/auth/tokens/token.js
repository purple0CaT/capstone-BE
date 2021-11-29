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
exports.generateRefreshJWT = exports.verifyRefreshJWT = exports.verifyJWT = exports.generateJWT = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema_1 = __importDefault(require("../../users/schema"));
process.env.TS_NODE_DEV && require("dotenv").config();
//
const generateJWT = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield createJWT({ _id: user._id });
    const refreshToken = yield createRefreshJWT({ _id: user._id });
    //
    return { accessToken, refreshToken };
});
exports.generateJWT = generateJWT;
//  GENERATE TOKENS
const createJWT = (payload) => new Promise((res, rej) => {
    jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "2d" }, (err, token) => {
        if (err)
            rej(err);
        else
            res(token);
    });
});
const createRefreshJWT = (payload) => new Promise((res, rej) => {
    jsonwebtoken_1.default.sign(payload, process.env.JWT_REFR_SECRET, { expiresIn: "1w" }, (err, token) => {
        if (err)
            rej(err);
        else
            res(token);
    });
});
// verify token
const verifyJWT = (token) => new Promise((res, rej) => {
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err)
            rej(err);
        else
            res(decodedToken);
    });
});
exports.verifyJWT = verifyJWT;
// verify REFRESH token
const verifyRefreshJWT = (token) => new Promise((res, rej) => {
    jsonwebtoken_1.default.verify(token, process.env.JWT_REFR_SECRET, (err, decodedToken) => {
        if (err)
            rej(err);
        else
            res(decodedToken);
    });
});
exports.verifyRefreshJWT = verifyRefreshJWT;
//  GENERATE TOKENS BASED ON REFRESH TOKEN
const generateRefreshJWT = (refToken) => __awaiter(void 0, void 0, void 0, function* () {
    const decodToken = yield (0, exports.verifyRefreshJWT)(refToken);
    const user = yield schema_1.default.findOne(decodToken);
    if (!user)
        throw (0, http_errors_1.default)(404, "User not found!");
    if (user.refreshToken === refToken) {
        const { accessToken, refreshToken } = yield (0, exports.generateJWT)(user);
        return { accessToken, refreshToken };
    }
    else {
        throw (0, http_errors_1.default)(401, "Token not valid");
    }
});
exports.generateRefreshJWT = generateRefreshJWT;
