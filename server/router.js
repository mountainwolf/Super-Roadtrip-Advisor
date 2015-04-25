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

router.get('/db', loggedIn, function(req, res) {


  var ref = createFirebaseRef();
  var childRef = ref.child('Users');

  var userRef = childRef.child(req.user.id);
  userRef.once('value', function (userData) {

            var theData = userData.val();
            var arr = [];
            for (var key in theData) {
              arr.push(theData[key]);
            }
            res.end(JSON.stringify(arr));
          });
});

router.post('/db', loggedIn, function(req, res) {
  var uid = req.body.id;
  var ref = createFirebaseRef();

  var childRef = ref.child('Users');
  
  var userRef = childRef.child(req.user.id);
  var placeRef = userRef.child(uid);

  placeRef.set(req.body);

  res.end();
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
