import express from 'express';
import fs from 'fs';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';
import Api from './api';
import DBConnection from './data/DB';
import morgan from 'morgan';
import { config } from 'dotenv';
import { Client, Pool } from 'pg';
config();

export interface IContext {
    client: Client;
}

var app = express();
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      decodeURI(tokens.url(req, res)),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ');
  }));
app.use(cors({
    origin: ['http://localhost:8080', 'http://10.0.0.112:8080', 'http://badetemp.net', 'http://www.badetemp.net', 'http://badetemp.net:8080', 'http://www.badetemp.net:8080'],
}));

(async () => {
    app.use('/graphql', graphqlHTTP({
        schema: buildSchema(fs.readFileSync(__dirname + '/../src/api.gql').toString()),
        rootValue: new Api(),
        graphiql: !!process.env.GRAPHIQL,
        context: {
            client: (() => {
                const client = new Client();
                client.connect();
                return client;
            })(),
        },
        extensions: (info => {
            (info.context as IContext).client.end();
            return null;
        }),
    }));
    app.listen(3000);
    console.log('Running a GraphQL API server at http://localhost:3000/graphql');
})();
