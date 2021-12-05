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
exports.clearAppointments = exports.checkAvailability = exports.checkFreeDays = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const schema_1 = __importDefault(require("./schema"));
const schema_2 = __importDefault(require("./../creator/schema"));
// CHECK AVAILABILITY AND APPOINTMENTS
const checkFreeDays = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creator = yield schema_2.default.findById(req.params.creatorId);
        const checkAppoint = creator.booking.availability.some((A) => A.start <= new Date(req.body.appointmentDate) &&
            A.end >= new Date(req.body.appointmentDate) &&
            A.start <= new Date(req.body.appointmentEnd) &&
            A.end >= new Date(req.body.appointmentEnd));
        //============== Availability Checks
        const bookingsData = yield Promise.all(creator.booking.appointments.map((AP) => __awaiter(void 0, void 0, void 0, function* () { return yield schema_1.default.findById(AP); })));
        const checkBookings = bookingsData.some((d) => d.appointmentDate <= new Date(req.body.appointmentDate) &&
            d.appointmentDate.setHours(d.appointmentDate.getHours() + 1) >=
                new Date(req.body.appointmentDate));
        // ===
        return { checkAppoint, checkBookings };
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, error);
    }
});
exports.checkFreeDays = checkFreeDays;
//  Check only availability
const checkAvailability = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creatorAvailabil = yield schema_2.default.findById(req.user.creator);
        const checkIt = creatorAvailabil.booking.availability.some((A) => A.start <= new Date(req.body.start) &&
            A.end >= new Date(req.body.start) &&
            A.start <= new Date(req.body.end) &&
            A.end >= new Date(req.body.end));
        return !checkIt;
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, error);
    }
});
exports.checkAvailability = checkAvailability;
const clearAppointments = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const creator = yield schema_2.default.findById(req.user.creator);
        // Promise.all(
        //   filtered.map(
        //     async (F) =>
        //       await CreatorSchema.findByIdAndUpdate(req.user.creator, {
        //         $pop: { "booking.availability": F },
        //       })
        //   )
        // );
        if (creator) {
            const filtered = creator.booking.availability.filter((A) => A.end >= new Date());
            creator.booking.availability = filtered;
            yield creator.save();
        }
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, error);
    }
});
exports.clearAppointments = clearAppointments;
