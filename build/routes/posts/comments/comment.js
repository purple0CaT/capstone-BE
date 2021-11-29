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
const tokenCheck_1 = require("../../../middlewares/authorization/tokenCheck");
const schema_1 = __importDefault(require("./schema"));
const schema_2 = __importDefault(require("../schema"));
//
const commentRoute = express_1.default.Router();
//
commentRoute.get("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
commentRoute.get("/:commentId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield schema_1.default.findById(req.params.commentId);
        res.send(comment);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
commentRoute.delete("/:commentId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield schema_1.default.findByIdAndDelete(req.params.commentId);
        res.status(203).send();
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
commentRoute.post("/add/:postId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = new schema_1.default(req.body);
        yield comment.save();
        const post = yield schema_2.default.findByIdAndUpdate(req.params.postId, {
            $push: { comments: comment._id },
        });
        res.status(201).send(post);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = commentRoute;
