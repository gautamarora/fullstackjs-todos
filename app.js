import express from 'express';
import bodyParser from 'body-parser';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose from 'mongoose';

//graphql setup
import typeDefs from './schema'
import resolvers from './resolvers'
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

//mongoose setup
import Todo from './models'
mongoose.connect('mongodb://localhost/todos-graphql', {useMongoClient: true});

const PORT = 3000;

const app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: { Todo } }));
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

app.listen(PORT);