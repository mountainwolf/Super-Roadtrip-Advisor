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

router.get('/dbt', loggedIn, function(req, res) {
  var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            })
  var ref = createFirebaseRef();


  var childRef = ref.child('Users');

  
  var userRef = childRef.child(req.user.id);
  var tripRef = userRef.child(uid);

  tripRef.set({
    word1: {
      "trip1": {
        test1:2},
                 "trip2":{test2:4}},
               trip1: {"trip":{test3:2},
               trip2:{test4:4}}});

  res.end('success');
});

router.post('/dbt', loggedIn, function(req, res) {
  var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            })
  var ref = createFirebaseRef();


  var childRef = ref.child('Users');

  
  var userRef = childRef.child(req.user.id);
  var tripRef = userRef.child(uid);

  tripRef.set(req.body.dataObj);

  res.end();
});

router.get('/db', loggedIn, function(req, res) {


  var ref = createFirebaseRef();
  var childRef = ref.child('Users');

  var userRef = childRef.child(req.user.id);
  userRef.once('value', function (userData) {
            console.log('userData:', userData);
            var theData = userData.val();
            console.log('user ref', JSON.stringify(theData));
            var arr = [];
            for (var key in theData) {
              console.log(key, theData[key]);
              arr.push(theData[key]);
            }
            res.end(JSON.stringify(arr));
          });
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
