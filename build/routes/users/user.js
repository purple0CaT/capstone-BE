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
const schema_2 = __importDefault(require("../followers/schema"));
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
userRoute
    .route("/")
    .get(tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        let allUsers;
        if (search.length > 1) {
            allUsers = yield schema_1.default.find({
                $or: [
                    { firstname: { $regex: `${search}`, $options: "i" } },
                    { lastname: { $regex: `${search}`, $options: "i" } },
                    { nickname: { $regex: `${search}`, $options: "i" } },
                ],
            }).select(["_id", "firstname", "lastname", "email", "avatar"]);
        }
        else {
            allUsers = yield schema_1.default.find();
        }
        res.send(allUsers);
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}))
    .put(tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
        });
        res.send(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}))
    .delete(tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndDelete(req.user._id);
        res.status(204);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
userRoute.get("/me", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followers = yield schema_2.default.findById(req.user.followers).populate([
            {
                path: "followers",
                select: ["firstname", "lastname", "avatar"],
            },
            {
                path: "youFollow",
                select: ["firstname", "lastname", "avatar"],
            },
        ]);
        res.send({ user: req.user, followers });
    }
    catch (error) {
        console.log(error);
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
userRoute.put("/background", tokenCheck_1.authJWT, (0, multer_1.default)({ storage: storage }).single("media"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.user._id, {
            background: req.file.path,
        }, { new: true });
        res.send(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
userRoute.get("/single/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findById(req.params.userId).populate([
            "shopping.orders",
            "booking",
        ]);
        const followers = yield schema_2.default.findById(user.followers).populate([
            {
                path: "followers",
                select: ["firstname", "lastname", "avatar"],
            },
            {
                path: "youFollow",
                select: ["firstname", "lastname", "avatar"],
            },
        ]);
        res.send({ user, followers });
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
userRoute.put("/single/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.params.userId, req.body);
        const followers = yield schema_2.default.findById(user.followers).populate([
            {
                path: "followers",
                select: ["firstname", "lastname", "avatar"],
            },
            {
                path: "youFollow",
                select: ["firstname", "lastname", "avatar"],
            },
        ]);
        res.send({ user, followers });
    }
    catch (error) {
        next((0, http_errors_1.default)(500));
    }
}));
exports.default = userRoute;
