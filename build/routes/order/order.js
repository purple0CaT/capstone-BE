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
const schema_2 = require("../shop/schema");
const schema_3 = __importDefault(require("../users/schema"));
const schema_4 = __importDefault(require("./schema"));
//
const orderRoute = express_1.default.Router();
//
orderRoute.get("/", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield schema_4.default.find();
        res.send(orders);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
// Only DEFAULT items
orderRoute.get("/adminOrders", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield schema_4.default.find({ "items.item.type": "default" });
        res.send(orders);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.get("/:orderId", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield schema_4.default.findById(req.params.orderId);
        res.send(orders);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.put("/delivery/:orderId", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_4.default.findByIdAndUpdate(req.params.orderId, { deliveryCodeTracking: req.body.deliveryCodeTracking }, { new: true });
        res.send(order);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.post("/createOrder", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //   Create new order
        const newOrder = new schema_4.default(Object.assign(Object.assign({}, req.body), { customerId: req.user._id }));
        yield newOrder.save();
        // Update items quantity in store
        req.body.items.map((I) => __awaiter(void 0, void 0, void 0, function* () {
            return yield schema_2.ItemsSchema.findByIdAndUpdate(I.item._id, {
                $inc: { quantity: -I.qty },
            });
        }));
        // user update
        const myUser = yield schema_3.default.findByIdAndUpdate(req.user._id, {
            $push: { "shopping.orders": newOrder._id },
        }, { new: true });
        //
        const sellerUser = yield schema_3.default.findById(req.body.sellerId);
        const sellerCreator = yield schema_1.default.findByIdAndUpdate(sellerUser.creator, { $push: { "shop.orders": newOrder._id } }, { new: true });
        //==== PayPal logic
        //  <>
        //
        res.status(201).send(myUser);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = orderRoute;
