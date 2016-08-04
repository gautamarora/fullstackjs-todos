var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/users');

router.get('/', function(req, res) {
  res.render('index', { title: 'Todos', user: req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
  User.register(new User({username: req.body.username }), req.body.password, function(err, user) {
    if(err) {
      return res.render('register' , { error : err.message });
    }
    passport.authenticate('local')(req, res, function () {
      req.session.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', {user: req.user});
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  // passport.authenticate('local')(req, res, function(err, user) {
  //   if (err) {
  //     console.log(err);
  //     return res.render('login' , { error : err.message });
  //   }
  // })
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


module.exports = router;










