const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserModel = require("../../../../services/users/schema");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BE_URI } = process.env;
const { generateTokens } = require("../../tokens");

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BE_URI}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log(profile);
        const { email, given_name, family_name, picture } = profile._json;
        //verify if the user is already registered
        const user = await User.findOne({ email });
        if (!user) {
          //register the user
          const newUser = new User({
            name: given_name,
            lastname: family_name,
            imageUrl: picture,
            email,
            googleId: profile.id,
            username: email,
          });
          const savedUser = await newUser.save();
          const tokens = await generateTokens(savedUser);
          done(undefined, { user: savedUser, tokens });
        } else {
          //generate token
          const tokens = await generateTokens(user);
          console.log(tokens);
          done(undefined, { user, tokens });
        }
      } catch (err) {
        console.log(err);
        done(err, undefined);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
