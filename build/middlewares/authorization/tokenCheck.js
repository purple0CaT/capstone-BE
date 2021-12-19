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
exports.authJWT = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const token_1 = require("../../routes/auth/tokens/token");
const schema_1 = __importDefault(require("../../routes/users/schema"));
const authJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        next((0, http_errors_1.default)(401, "Provide credentials"));
    }
    else {
        try {
            const token = req.headers.authorization.replace("Bearer ", "");
            const decodeToken = yield (0, token_1.verifyJWT)(token);
            const user = yield schema_1.default.findById(decodeToken._id).populate({
                path: "shopping.orders",
            });
            if (user) {
                req.user = user;
                next();
            }
            else {
                next((0, http_errors_1.default)(404, "User not found!"));
            }
        }
        catch (error) {
            next((0, http_errors_1.default)(400, "Relogin"));
        }
    }
});
exports.authJWT = authJWT;
