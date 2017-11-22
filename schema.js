export default `
  type Todo {
    _id: String!
    text: String!
  }

  type Query {
    allTodos: [Todo!]!
  }

  type Mutation {
    createTodo(text: String!): Todo!
  }
`;