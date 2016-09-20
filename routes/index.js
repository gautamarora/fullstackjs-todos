var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/users');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Todos', user: req.user });
});

router.post('/register', function(req, res, next) {
  User.register(new User({username: req.body.username }), req.body.password, function(err, user) {
    if(err) {
      return res.json(403, {
          message: err.message
      });
    }
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            return res.json(403, {
                message: "no user found"
            });
        }
        req.login(user, function(err) {
            if (err) return next(err);
            return res.json({
                message: 'user authenticated',
                user: user
            });
        });
    })(req, res, next);
  });
});

router.post('/login', function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
          return res.json(403, {
              message: "no user found"
          });
      }
      req.login(user, function(err) {
          if (err) return next(err);
          return res.json({
              message: 'user logged in',
              user: user
          });
      });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  return res.json({
      message: 'user logged out'
  });
});

module.exports = router;
