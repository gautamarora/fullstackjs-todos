var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var TodoSchema = new Schema({
  user : { ref: 'User', type: Schema.ObjectId },
  text: {type: 'String', required: true},
  done: {type: 'Boolean'}
});

var Todo = mongoose.model('Todo', TodoSchema);

module.exports = Todo;