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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const schema_1 = __importDefault(require("../../users/schema"));
const token_1 = require("../tokens/token");
const schema_2 = __importDefault(require("../../followers/schema"));
process.env.TS_NODE_DEV && require("dotenv").config();
const googleStrategy = new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.URL}/login/googleRed`,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const user = yield schema_1.default.findOne({ googleId: profile.id });
    if (user) {
        const tokens = yield (0, token_1.generateJWT)(user);
        user.refreshToken = tokens.refreshToken;
        yield user.save();
        done(null, { user, tokens });
    }
    else {
        try {
            const newUser = {
                firstname: (_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName,
                lastname: (_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName,
                nickname: `${(_c = profile.name) === null || _c === void 0 ? void 0 : _c.givenName.toLowerCase()}.${(_d = profile.name) === null || _d === void 0 ? void 0 : _d.familyName.toLowerCase()}`,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0].value,
                refreshToken: "",
                followers: "",
            };
            const createdUser = new schema_1.default(newUser);
            //
            const UserFollowers = new schema_2.default({
                youFollow: [],
                followers: [],
            });
            yield UserFollowers.save();
            //
            const tokens = yield (0, token_1.generateJWT)(createdUser);
            createdUser.refreshToken = tokens.refreshToken;
            createdUser.followers = UserFollowers._id;
            yield createdUser.save();
            done(null, { user: createdUser, tokens });
        }
        catch (error) {
            done(null, { error });
        }
    }
}));
passport_1.default.serializeUser(function (data, done) {
    done(null, data);
});
exports.default = googleStrategy;
