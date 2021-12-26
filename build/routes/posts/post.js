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
const schema_1 = __importDefault(require("./schema"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const mongoose_1 = __importDefault(require("mongoose"));
const schema_2 = __importDefault(require("./../followers/schema"));
//
const ObjectId = mongoose_1.default.Types.ObjectId;
//
const postRoute = express_1.default.Router();
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            folder: "sandoraw-posts",
        };
    }),
});
//
postRoute.get("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allPosts = yield schema_1.default.find({})
            .sort("-createdAt")
            .populate([
            {
                path: "comments",
                populate: {
                    path: "author",
                    select: ["firstname", "lastname", "avatar"],
                },
            },
            {
                path: "author",
                select: ["firstname", "lastname", "avatar", "creator"],
            },
        ]);
        res.send(allPosts);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.get("/followed", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const followed = yield schema_2.default.findById(req.user.followers);
        const userFollow = followed.youFollow.map((F) => ({
            author: F,
        }));
        if (userFollow.length > 0) {
            const allPosts = yield schema_1.default.find({ $or: userFollow })
                .sort("-createdAt")
                .populate([
                {
                    path: "comments",
                    populate: {
                        path: "author",
                        select: ["firstname", "lastname", "avatar"],
                    },
                },
                {
                    path: "author",
                    select: ["firstname", "lastname", "avatar", "creator"],
                },
            ]);
            res.send(allPosts);
        }
        else {
            res.send([]);
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.get("/single/:postId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield schema_1.default.findById(req.params.postId).populate([
            {
                path: "comments",
                populate: {
                    path: "author",
                    select: ["firstname", "lastname", "avatar"],
                },
            },
            {
                path: "author",
                select: ["firstname", "lastname", "avatar", "creator"],
            },
        ]);
        res.send(post);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.get("/userPosts/:userId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield schema_1.default.find({
            author: new ObjectId(req.params.userId),
        })
            .populate([
            {
                path: "comments",
                populate: {
                    path: "author",
                    select: ["firstname", "lastname", "avatar"],
                },
            },
            {
                path: "author",
                select: ["firstname", "lastname", "avatar", "creator"],
            },
        ])
            .sort("-createdAt");
        res.send(post);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.post("/likes/:postId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield schema_1.default.findById(req.params.postId);
        const liked = post.likes.some((L) => L === req.user._id.toString());
        if (liked) {
            yield schema_1.default.findByIdAndUpdate(req.params.postId, {
                $pull: { likes: req.user._id.toString() },
            });
        }
        else {
            yield schema_1.default.findByIdAndUpdate(req.params.postId, {
                $push: { likes: req.user._id.toString() },
            });
        }
        res.send({ message: "Liked" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
//
postRoute.post("/", tokenCheck_1.authJWT, (0, multer_1.default)({ storage: storage }).single("media"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let editBody;
        if (req.body.locCord) {
            editBody = {
                text: req.body.text,
                location: {
                    title: req.body.locTitle,
                    cord: req.body.locCord.split(", "),
                },
            };
        }
        else {
            editBody = req.body;
        }
        const newPost = new schema_1.default(Object.assign(Object.assign({}, editBody), { media: req.file.path, author: req.user._id }));
        yield newPost.save();
        res.send(newPost);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.put("/single/:postId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield schema_1.default.findByIdAndUpdate(req.params.postId, req.body, { new: true }).populate([
            {
                path: "comments",
                populate: {
                    path: "author",
                    select: ["firstname", "lastname", "avatar"],
                },
            },
            {
                path: "author",
                select: ["firstname", "lastname", "avatar", "creator"],
            },
        ]);
        res.send(post);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.delete("/single/:postId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield schema_1.default.findByIdAndDelete(req.params.postId);
        res.status(201).send({ message: "Deleted!" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
postRoute.put("/media/:postId", tokenCheck_1.authJWT, (0, multer_1.default)({ storage: storage }).single("media"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield schema_1.default.findByIdAndUpdate(Object.assign(Object.assign({}, req.body), { media: req.file.path, author: req.user._id }));
        res.send(post);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = postRoute;
