import { ApolloServer, gql } from 'apollo-server';
import fs from 'fs';
import Api from './api';
import { config } from 'dotenv';
import { getSessionUserId } from './data/Auth';
import DBConnection from './data/DB';
config();

export interface IContext {
    userId: number;
    dbConnection: DBConnection;
}

(async () => {
    const dbConnection = new DBConnection();
    const app = new ApolloServer({
        typeDefs: gql(fs.readFileSync(__dirname + '/../src/api.gql').toString()),
        resolvers: Api,
        context: async (ctx): Promise<IContext> => ({
            userId: await getSessionUserId(dbConnection, ctx.req.headers.authorization),
            dbConnection: dbConnection,
        }),
    });
    app.listen(3000);
    console.log('Running a GraphQL API server at http://localhost:3000/graphql');
})();