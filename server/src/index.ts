import 'reflect-metadata';
import { connectToDatabase } from './loaders/mongodb';
import { createApolloServer } from './loaders/apollo';
import { createExpressServer } from './loaders/express';


void async function startServer() {
    await connectToDatabase();
    const apolloServer = await createApolloServer();
    await createExpressServer(apolloServer);
}();
