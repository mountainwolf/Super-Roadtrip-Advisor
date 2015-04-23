var requestHandler = require('./request-handler');
var express = require('express');
var router = express.Router();
var path = require('path');
var passport = require('./authentication/authentication');
var loggedIn = require('./authentication/utility').loggedIn;
var isLoggedIn = require('./authentication/utility').isLoggedIn;
var createFirebaseRef = require('./db/database');

router.get('/main/auth',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] }),
  function(req, res){});


router.get('/main/auth/success',
  passport.authenticate('google', { failureRedirect: '/main' }),
  function(req, res) {
    res.redirect('/favorites');
  });

router.get('/favorites', loggedIn, function(req, res){
  res.sendFile(path.join(__dirname,'../client', 'favorites.html'));
});

router.post('/db', loggedIn, function(req, res) {
  ref = createFirebaseRef();

  var trip = req.params.trip;

  var childRef = ref.child('Users');

  var userRef = childRef.child(req.user.id);
  var tripRef = userRef.child(trip.start + ' ' + trip.end);

  tripRef.set({
            start: trip.start,
            end: trip.end,
            places: trip.places
    });

  res.end('success');
});

router.get('/dbtest', function(req, res) {
  ref = createFirebaseRef();

  req.params.trip = {
    start: "here",
    end: "there",
    places:{
      "url1com":true
    }
  }

  var trip = req.params.trip;

  var childRef = ref.child('Users');

  var userRef = childRef.child(req.user.id);
  var tripRef = userRef.child(trip.start + ' ' + trip.end);

  tripRef.set({
            start: trip.start,
            end: trip.end,
            places: trip.places
    });
  res.end('success');
});

router.post('/search', function(req, res) {
  console.log('(POST "/search") Now searching the Yelp API...');

  var googleCoords = req.body.waypoints;
  var distance = req.body.distance;
  var limit = req.body.limit;

  requestHandler.performSearch(req, res, googleCoords, distance, limit);
});

router.get('/main', isLoggedIn, function (req, res) {
  res.sendFile(path.join(__dirname,'../client', 'main.html'));
});

router.post('/*', function(req, res) {
  console.log('POST to unknown page - redirecting to homepage.');
  res.redirect('/');
});

router.get('/*', function (req, res) {
  res.redirect('/');
});

module.exports = router;
