export default {
  Query: {
    allTodos: async (parent, args, { Todo }) => await Todo.find()
  },
  Mutation: {
    createTodo: async (parent, args, { Todo }) => await new Todo(args).save()
  }
}