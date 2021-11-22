import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import supertest from "supertest";
import { app } from "../server";
dotenv.config();

const request = supertest(app);
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
    mongoose.connect(process.env.MONGO_URL_TEST!).then(() => {
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
  it("Register: with a valid request =>  201 and Token's", async () => {
    const res = await request.post("/register").send(validCredentials);
    // console.log(res.body);
    const { _id } = jwt.verify(
      res.body.tokens.accessToken,
      process.env.JWT_SECRET!
    ) as any as { _id: string };
    expect(_id).toBe(res.body.user._id);
    expect(res.status).toBe(201);
  });
  it("Login: with a valid request =>  200 and valid Token", async () => {
    const res = await request.post("/login").send(validCredentials);
    // console.log(res.body);
    const { _id } = jwt.verify(
      res.body.tokens.accessToken,
      process.env.JWT_SECRET!
    ) as any as { _id: string };
    // expect(res.status).toBe(200);
    expect(_id).toBe(res.body.user._id);
  });
  //
  afterAll((done) => {
    mongoose.connection
      .dropDatabase()
      .then(() => {
        return mongoose.connection.close();
      })
      .then(() => done());
  });
});
