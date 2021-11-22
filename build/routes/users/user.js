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
const tokenCheck_1 = require("../../middlewares/authorization/tokenCheck");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const schema_1 = __importDefault(require("./schema"));
const multer_1 = __importDefault(require("multer"));
const userRoute = express_1.default.Router();
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            folder: "sandoraw-avatars",
        };
    }),
});
//
userRoute.get("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield schema_1.default.find();
        res.send(allUsers);
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
userRoute.get("/me", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.send(req.user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
userRoute.put("/avatar", tokenCheck_1.authJWT, (0, multer_1.default)({ storage: storage }).single("media"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.user._id, {
            avatar: req.file.path,
        }, { new: true });
        res.send(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
userRoute.put("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
        });
        res.send(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
userRoute.delete("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndDelete(req.user._id);
        res.status(201).send({ message: "Deletet!" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = userRoute;
