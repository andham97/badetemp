import express from 'express';
import fs from 'fs';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import Api from './api';

var app = express();

app.use(cors({
    origin: ['http://localhost:8080', 'http://10.0.0.112:8080', 'http://badetemp.net', 'http://www.badetemp.net', 'http://badetemp.net:8080', 'http://www.badetemp.net:8080'],
}));

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(fs.readFileSync(__dirname + '/../src/api.gql').toString()),
    rootValue: new Api(),
    graphiql: true,
}));
app.listen(3000);
console.log('Running a GraphQL API server at http://localhost:3000/graphql');