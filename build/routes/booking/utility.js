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
exports.checkFreeDays = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const schema_1 = __importDefault(require("./schema"));
const schema_2 = __importDefault(require("./../creator/schema"));
//
const checkFreeDays = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availabilityCheck = yield schema_2.default.findById(req.params.creatorId);
        const checkAppoint = availabilityCheck.booking.availability.some((A) => A.start <= new Date(req.body.appointmentDate) &&
            A.end >= new Date(req.body.appointmentDate));
        //==============
        const bookingsData = yield Promise.all(availabilityCheck.booking.appointments.map((AP) => __awaiter(void 0, void 0, void 0, function* () { return yield schema_1.default.findById(AP); })));
        const checkBookings = bookingsData.some((d) => d.appointmentDate <= new Date(req.body.appointmentDate) &&
            d.appointmentDate.setHours(d.appointmentDate.getHours() + 1) >=
                new Date(req.body.appointmentDate));
        return { checkAppoint, checkBookings };
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, error);
    }
});
exports.checkFreeDays = checkFreeDays;
