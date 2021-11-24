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
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
dotenv_1.default.config();
const request = (0, supertest_1.default)(server_1.app);
//
describe("Testing the testing environment", () => {
    it("should pass", () => {
        expect(true).toBe(true);
    });
});
//
describe("Authorization endpoints", () => {
    //
    beforeAll((done) => {
        mongoose_1.default.connect(process.env.MONGO_URL_TEST).then(() => {
            console.log("Connected to Mongo 🍁");
            done();
        });
    });
    //
    const validCredentials = {
        firstname: "Name",
        lastname: "Surname",
        email: "test@mail.com",
        password: "1234",
    };
    //
    it("Register: with a valid request =>  201 and Token's", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.post("/register").send(validCredentials);
        // console.log(res.body);
        const { _id } = jsonwebtoken_1.default.verify(res.body.tokens.accessToken, process.env.JWT_SECRET);
        expect(_id).toBe(res.body.user._id);
        expect(res.status).toBe(201);
    }));
    it("Login: with a valid request =>  200 and valid Token", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request.post("/login").send(validCredentials);
        // console.log(res.body);
        const { _id } = jsonwebtoken_1.default.verify(res.body.tokens.accessToken, process.env.JWT_SECRET);
        // expect(res.status).toBe(200);
        expect(_id).toBe(res.body.user._id);
    }));
    //
    afterAll((done) => {
        mongoose_1.default.connection
            .dropDatabase()
            .then(() => {
            return mongoose_1.default.connection.close();
        })
            .then(() => done());
    });
});
