import { graphql, GraphQLSchema } from 'graphql';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';

import { buildGraphQLSchema } from '../../../src/loaders/graphql';
import { DeepPartial } from '../DeepPartial';


export interface ExecuteGraphQLOperationOptions {
    source: string; // graphql query/mutation etc
    variableValues?: Record<string, any>;
    contextValue?: DeepPartial<ExpressContext>;
}

let schema: GraphQLSchema;

export async function executeGraphQLOperation(options: ExecuteGraphQLOperationOptions) {
    const { source, variableValues, contextValue } = options;

    if (!schema) {
        schema = await buildGraphQLSchema();
    }

    return graphql({ schema, source, variableValues, contextValue });
}
