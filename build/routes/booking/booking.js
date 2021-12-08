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
const schema_2 = __importDefault(require("./../creator/schema"));
const creator_1 = require("../../middlewares/creator/creator");
const schema_3 = __importDefault(require("../users/schema"));
const utility_1 = require("./utility");
//
const bookingRoute = express_1.default.Router();
//
// bookingRoute.get("/creator/:creatorId", authJWT, async (req, res, next) => {
//   try {
//     const appointments = await CreatorSchema.findById(
//       req.params.creatorId
//     ).populate("booking.appointments");
//     res.send(appointments);
//   } catch (error) {
//     next(createHttpError(500, error as Error));
//   }
// });
bookingRoute.post("/createAppoint/:creatorId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { checkAppoint, checkBookings } = yield (0, utility_1.checkFreeDays)(req);
        if (checkAppoint && !checkBookings) {
            //
            const newAppointment = new schema_1.default(Object.assign(Object.assign({}, req.body), { user: req.user._id }));
            yield newAppointment.save();
            //
            const user = yield schema_3.default.findByIdAndUpdate(req.user._id, {
                $push: { booking: newAppointment._id },
            });
            //
            const creator = yield schema_2.default.findByIdAndUpdate(req.params.creatorId, { $push: { "booking.appointments": newAppointment._id } }, { new: true });
            res.send({ creator, newAppointment });
        }
        else {
            next((0, http_errors_1.default)(400, "This date's booked or not avaible"));
        }
    }
    catch (error) {
        console.log(error);
        next((0, http_errors_1.default)(500, error));
    }
}));
bookingRoute.get("/appointment/:bookingId", tokenCheck_1.authJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const specific = yield schema_1.default.findById(req.params.bookingId);
        res.send(specific);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
// bookingRoute.post(
//   "/appointment/:bookingId",
//   authJWT,
//   async (req, res, next) => {
//     try {
//       const specific = await BookingSchema.findByIdAndUpdate(
//         req.params.bookingId,
//         req.body,
//         { new: true }
//       );
//       res.send(specific);
//     } catch (error) {
//       next(createHttpError(500, error as Error));
//     }
//   }
// );
bookingRoute.post("/setavailability", tokenCheck_1.authJWT, creator_1.creatorAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkAvail = yield (0, utility_1.checkAvailability)(req);
        // clearAppointments(req);
        if (checkAvail) {
            const creator = yield schema_2.default.findByIdAndUpdate(req.user.creator, {
                $push: {
                    "booking.availability": req.body,
                },
            }, { new: true });
            res.send(creator);
        }
        else {
            next((0, http_errors_1.default)(400, "Availability already set for this time, pick another one!"));
        }
    }
    catch (error) {
        next((0, http_errors_1.default)(500, error));
    }
}));
exports.default = bookingRoute;
