import mongoose from 'mongoose';
const ObjectId = mongoose.SchemaType.ObjectId;

export default {
  Query: {
    allTodos: async (parent, args, { Todo }) => await Todo.find(),
    doneTodos: async (parent, args, { Todo }) => await Todo.find({done: true})
  },
  Mutation: {
    createTodo: async (parent, args, { Todo }) => await new Todo(args).save(),
    updateTodoText: async (parent, args, { Todo }) => {
      const { _id, text } = args
      await Todo.update({_id }, { $set: { text }})
      return await Todo.findOne({_id: args._id})
    },
    updateTodoDone: async (parent, args, { Todo }) => {
      const { _id, done } = args
      await Todo.update({_id }, { $set: { done }})
      return await Todo.findOne({_id: args._id})
    }
  }
}