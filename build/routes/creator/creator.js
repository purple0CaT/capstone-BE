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
const schema_1 = require("../shop/schema");
const schema_2 = __importDefault(require("../users/schema"));
const schema_3 = __importDefault(require("./schema"));
//
const creatorRoute = express_1.default.Router();
//
creatorRoute.get("/me", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield schema_2.default.findById(req.user._id).populate([
            "creator",
            "shopping.cart",
        ]);
        const creatorInfo = yield schema_3.default.findById(req.user.creator).populate(["shop.items", "shop.orders"]);
        res.send({ creator: creatorInfo });
    }
    catch (error) {
        console.log(500);
        next((0, http_errors_1.default)(500, error));
    }
}));
creatorRoute.get("/single/:creatorId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield schema_3.default.findById(req.params.creatorId).populate("booking.appointments");
        res.send(appointments);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
creatorRoute.post("/beCreator", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield schema_2.default.findById(req.user._id);
        if (userInfo.creator) {
            next((0, http_errors_1.default)(400, " You are already a creator!"));
        }
        else {
            const newItem1 = new schema_1.ItemsSchema({
                title: "Landscape printed picture",
                price: 10,
                descrition: "Landscape printed picture of selected post with ratio: 16:9",
                quantity: 10,
                seller: req.user._id,
            });
            const newItem2 = new schema_1.ItemsSchema({
                title: "Portret printed picture",
                price: 10,
                descrition: "Portret printed picture of selected post with ratio: 3:4",
                quantity: 10,
                seller: req.user._id,
            });
            yield newItem1.save();
            yield newItem2.save();
            //
            const creator = new schema_3.default(Object.assign(Object.assign({}, req.body), { shop: { items: [newItem1._id, newItem2._id] } }));
            yield creator.save();
            userInfo.creator = creator._id;
            yield userInfo.save();
            res.send(userInfo);
        }
    }
    catch (error) {
        console.log(500);
        next((0, http_errors_1.default)(500, error));
    }
}));
creatorRoute.delete("/beUser", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creator = yield schema_3.default.findById(req.user.creator);
        if (creator) {
            creator.shop.items.map((I) => __awaiter(void 0, void 0, void 0, function* () { return yield schema_1.ItemsSchema.findByIdAndDelete(I._id); }));
            //
            yield schema_3.default.findOneAndDelete(req.user.creator);
            //
            const user = yield schema_2.default.findByIdAndUpdate(req.user._id, {
                creator: null,
            }, { new: true });
            res.send(user);
        }
        else {
            next((0, http_errors_1.default)(404, "You are not creator!"));
        }
    }
    catch (error) {
        console.log(500);
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = creatorRoute;
