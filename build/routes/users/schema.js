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
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
//
const { Schema, model } = mongoose_1.default;
//
const UserSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: {
        type: String,
        required: function () {
            return !Boolean(this.fbId || this.googleId);
        },
    },
    refreshToken: { type: String, required: false },
    email: { type: String, required: true, lowercase: true },
    avatar: {
        type: String,
        required: false,
        default: "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png",
    },
    googleId: {
        type: String,
        required: function () {
            return !Boolean(this.fbId || this.password);
        },
    },
    fbId: {
        type: String,
        required: function () {
            return !Boolean(this.googleId || this.password);
        },
    },
    shopping: {
        cart: [{ type: Object, required: false }],
        orders: [{ type: Schema.Types.ObjectId, ref: "Order", required: false }],
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Creator",
        default: null,
        required: false,
    },
    booking: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    type: { type: String, enum: ["admin", "user"], default: "user" },
    socket: { type: String, required: false },
    followers: { type: Schema.Types.ObjectId, ref: "Follower" },
});
//
UserSchema.pre("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const pass = user.password;
        if (user.isModified("password")) {
            user.password = yield bcrypt_1.default.hash(pass, 10);
        }
    });
});
//
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;
    return userObj;
};
//
UserSchema.statics.CheckCredentials = function (email, pass) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield this.findOne({ email });
        const all = yield this.find({ email: "Estevan_Keeling57@gmail.com" });
        if (user) {
            const isMatch = yield bcrypt_1.default.compare(pass, user.password);
            if (isMatch) {
                return user;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    });
};
exports.default = model("User", UserSchema);
