var express = require('express');
var router = express.Router();

var Todo = require('../../models/todos');

router.route('/')
  .get(function(req, res, next) {
    Todo.findAsync({},null,{sort: {"_id":1}})
    .then(function(todos) {
      res.json({todos: todos});
    })
    .catch(function(err){
      res.status(400).json({message: err.message});
    });
  })
  .post(function(req, res, next) {
    var todo = new Todo();
    todo.text = req.body.text;
    todo.saveAsync()
    .then(function(todo) {
      res.json({todo: todo});
    })
    .catch(function(err){
      res.status(400).json({message: err.message});
    });
  });

router.route('/:id')
  .get(function(req, res, next) {
    Todo.findOneAsync({_id: req.params.id}, {text: 1, done: 1})
    .then(function(todo) {
      res.json({todo: todo});
    })
    .catch(function(e){
      res.status(400).json({message: err.message});
    });
  })
  .put(function(req, res, next) {
    var todo = {};
    var prop;
    for (prop in req.body) {
      todo[prop] = req.body[prop];
    }
    Todo.updateAsync({_id: req.params.id}, todo)
    .then(function(updateLog) {
      return res.json({updated: true});
    })
    .catch(function(err){
      res.status(400).json({message: err.message});
    });
  })
  .delete(function(req, res, next) {
    Todo.findByIdAndRemoveAsync(req.params.id)
    .then(function(deletedTodo) {
      return res.json({deleted: true});
    })
    .catch(function(err) {
      res.status(400).json({message: err.message});
    });
  });

module.exports = router;