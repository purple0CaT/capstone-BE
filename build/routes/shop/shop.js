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
const creator_1 = require("../../middlewares/creator/creator");
const schema_1 = __importDefault(require("../creator/schema"));
const schema_2 = require("./schema");
// import { ShopSchema } from "./schema";
//
const shopRoute = express_1.default.Router();
//
shopRoute.get("/", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creator = yield schema_1.default.findById(req.user.creator);
        if (creator) {
            // const myShop = await ShopSchema.findById(creator.shop);
            res.send("Ok");
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
shopRoute.post("/addItem", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newItem = new schema_2.ItemsSchema(Object.assign(Object.assign({}, req.body), { type: "user", seller: req.user._id }));
        yield newItem.save();
        //
        const creatorShop = yield schema_1.default.findByIdAndUpdate(req.user.creator, {
            $push: {
                "shop.items": newItem._id,
            },
        }, { new: true });
        res.send(creatorShop);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
shopRoute.get("/item/:itemId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield schema_2.ItemsSchema.findById(req.params.itemId);
        res.send(item);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
shopRoute.put("/item/:itemId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield schema_2.ItemsSchema.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
        res.send(item);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
shopRoute.delete("/item/:itemId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield schema_2.ItemsSchema.findByIdAndDelete(req.params.itemId);
        res.send(item);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = shopRoute;
