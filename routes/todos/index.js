var express = require('express');
var router = express.Router();

var Todo = require('../../models/todos');

var isLoggedIn = function(req, res, next) {
  if(!req.user) {
    return res.redirect('/');
  }
  next();
}

router.get('/', isLoggedIn, function(req, res, next) {
  Todo.findAsync({user: req.user._id},null,{sort: {"_id":1}})
  .then(function(todos) {
    res.render('todos', {title: 'Todos', todos: todos, user: req.user});
  })
  .catch(next);
});

module.exports = router;