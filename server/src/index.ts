import 'reflect-metadata';
import { connectToDatabase } from './loaders/mongodb';
import { createApolloServer } from './loaders/apollo';
import { createExpressServer } from './loaders/express';


async function setupServer() {
    await connectToDatabase();
    const apolloServer = await createApolloServer();
    createExpressServer(apolloServer);
}

setupServer();
