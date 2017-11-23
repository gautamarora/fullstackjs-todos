export default `
  type Todo {
    _id: String!
    text: String!
    done: Boolean
  }

  type Query {
    allTodos: [Todo!]!
    doneTodos: [Todo!]!
  }

  type Mutation {
    createTodo(text: String!): Todo!
    updateTodoText(_id: String!, text: String!): Todo!
    updateTodoDone(_id: String!, done: Boolean!): Todo
  }
`;