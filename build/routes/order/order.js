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
const stripe_1 = __importDefault(require("stripe"));
//
const stripe = new stripe_1.default(process.env.STRIPE_SK, {
    apiVersion: "2020-08-27",
});
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
orderRoute.get("/one:orderId", tokenCheck_1.authJWT, 
// creatorAuth,
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield schema_4.default.findById(req.params.orderId);
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
orderRoute.put("/delivery/:orderId", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_4.default.findByIdAndUpdate(req.params.orderId, { deliveryCodeTracking: req.body.deliveryCodeTracking }, { new: true });
        res.send(order);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
// ============= ORDER create|cancel
orderRoute.post("/createOrder", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //   Create new order
        const newOrder = new schema_4.default(Object.assign(Object.assign({}, req.body), { customerId: req.user._id }));
        yield newOrder.save();
        // Update items quantity in store
        yield Promise.all(req.body.items.map((I) => __awaiter(void 0, void 0, void 0, function* () {
            return yield schema_2.ItemsSchema.findByIdAndUpdate(I.item._id, {
                $inc: { quantity: -I.qty },
            });
        })));
        // Customer user update
        yield schema_3.default.findByIdAndUpdate(req.user._id, {
            $push: { "shopping.orders": newOrder._id },
        });
        // Update Creator
        yield Promise.all(req.body.items.map((Item) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const sellerUser = yield schema_3.default.findById(Item.item.sellerId);
            const sellerCreator = yield schema_1.default.findById((_a = sellerUser.creator) === null || _a === void 0 ? void 0 : _a.toString());
            const checkAlready = sellerCreator.shop.orders.some((O) => O.toString() !== newOrder._id.toString());
            if (checkAlready) {
                sellerCreator.shop.orders.push(newOrder._id);
                // console.log(sellerCreator.shop.orders);
                yield sellerCreator.save();
            }
        })));
        // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3003");
        res.status(201).send(newOrder);
        // res.redirect(`/order/checkout-session/${newOrder._id}`);
    }
    catch (error) {
        console.log(error);
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.delete("/cancelorder/:orderId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_4.default.findById(req.params.orderId);
        order.items.map((I) => __awaiter(void 0, void 0, void 0, function* () {
            return yield schema_2.ItemsSchema.findByIdAndUpdate(I.item._id, {
                $inc: { quantity: I.qty },
            });
        }));
        // Update user orders
        yield schema_3.default.findByIdAndUpdate(order.customerId, {
            $pull: { "shopping.orders": req.params.orderId },
        });
        // update creator orders
        yield Promise.all(order.items.map((Item) => __awaiter(void 0, void 0, void 0, function* () {
            const seller = yield schema_3.default.findById(Item.item.sellerId);
            yield schema_1.default.findByIdAndUpdate(seller.creator, {
                $pull: { "shop.orders": req.params.orderId },
            });
        })));
        yield schema_4.default.findByIdAndDelete(req.params.orderId);
        // =>
        res.status(203).send({ message: "Order canceled!" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
// PAYMENTS
orderRoute.put("/submitpay/:orderId", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_4.default.findByIdAndUpdate(req.params.orderId, { paid: req.body.paid }, { new: true });
        res.send(order);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.get("/sessionIdCheck/:orderId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield stripe.checkout.sessions.retrieve(req.query.session_id);
        //
        // console.log(session);
        if (session.status === "complete" && session.payment_status === "paid") {
            const order = yield schema_4.default.findByIdAndUpdate(req.params.orderId, { paid: true }, { new: true });
            res.send(order);
        }
        else {
            next((0, http_errors_1.default)(400, "Order not paid or false credentials!"));
        }
        //
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
orderRoute.get("/checkout-session/:orderId", 
// authJWT,
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield schema_4.default.findById(req.params.orderId);
        // if (req.user._id.toString() !== order.customerId.toString()) {
        //   next(createHttpError(400, "You cannot purchase this order!"));
        // } else {
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: order.items.map((I) => {
                return {
                    price_data: {
                        currency: "gbp",
                        product_data: {
                            name: I.item.title,
                        },
                        unit_amount: I.item.price * 100,
                    },
                    quantity: I.qty,
                };
            }),
            success_url: `${process.env.CLIENT_URL}/success/${req.params.orderId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/order`,
        });
        // res.send({ url: session.url });
        res.redirect(`${session.url}`);
        // }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = orderRoute;
