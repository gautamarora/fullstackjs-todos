// const Todo = mongoose.model('Todo', { text: String })
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = mongoose.SchemaType.ObjectId;

mongoose.promise = global.promise

const TodoSchema = new Schema({
  text: {type: 'String', required: true},
  done: {type: 'Boolean'}
})

const Todo = mongoose.model('Todo', TodoSchema)
export default Todo