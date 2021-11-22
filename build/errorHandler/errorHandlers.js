"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAllHandler = exports.generalErrHandl = void 0;
const generalErrHandl = (err, req, res, next) => {
    if (err.status >= 400 && err.status < 500) {
        res.status(err.status).send({
            status: "error",
            message: err.message || "Error!",
        });
    }
    else {
        next(err);
    }
};
exports.generalErrHandl = generalErrHandl;
const catchAllHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ status: "error", message: "Generic Server Error" });
};
exports.catchAllHandler = catchAllHandler;
