"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const request = supertest(app);
//
describe("Testing the testing environment", () => {
    it("should pass", () => {
        expect(true).toBe(true);
    });
});
