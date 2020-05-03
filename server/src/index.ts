import 'reflect-metadata';
import { connectToDatabase } from './loaders/mongodb';
import { createGraphQLServer } from './loaders/graphql';


async function setupServer() {
    await connectToDatabase();
    await createGraphQLServer();
}

setupServer();
