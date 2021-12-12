import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import UserSchema from "../../users/schema";
import { generateJWT } from "../tokens/token";
import FollowSchema from "../../followers/schema";

process.env.TS_NODE_DEV && require("dotenv").config();
const googleStrategy = new Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.URL}/login/googleRed`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await UserSchema.findOne({ googleId: profile.id });
    if (user) {
      const tokens = await generateJWT(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();
      done(null, { user, tokens });
    } else {
      try {
        const newUser = {
          firstname: profile.name?.givenName,
          lastname: profile.name?.familyName,
          nickname: "test",
          email: profile.emails![0].value,
          googleId: profile.id,
          avatar: profile.photos![0].value,
          refreshToken: "",
          followers: "",
        };
        const createdUser = new UserSchema(newUser);
        //
        const UserFollowers = new FollowSchema({
          youFollow: [],
          followers: [],
        });
        await UserFollowers.save();
        //
        const tokens = await generateJWT(createdUser);
        createdUser.refreshToken = tokens.refreshToken;
        createdUser.followers = UserFollowers._id;
        await createdUser.save();
        done(null, { user: createdUser, tokens });
      } catch (error) {
        done(null, { error });
      }
    }
  },
);

passport.serializeUser(function (data, done) {
  done(null, data);
});

export default googleStrategy;
