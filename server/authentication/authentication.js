var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , key = require('../api/api_key').fb;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: key.app_id,
    clientSecret: key.secret,
    callbackURL: "http://localhost:3456/main/auth/success"
  },
  function(accessToken, refreshToken, profile, done) {

    done(null, profile);
  }
));

module.exports = passport;