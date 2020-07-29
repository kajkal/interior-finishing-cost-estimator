import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Handler } from './Handler';
import { ErrorHandler } from './ErrorHandler';
import { ErrorMarker } from './ErrorMarker';


export class ApolloErrorHandler {

    private constructor(
        private readonly error: unknown,
        private readonly apolloError?: ApolloError,
    ) {
    }

    static process(error: unknown): ApolloErrorHandler {
        if (error instanceof ApolloError) {
            return new this(error, error);
        }
        return new this(error);
    }

    handleGraphQlError(message: string, handler: Handler<GraphQLError>): ApolloErrorHandler {
        const graphQLErrors = this.apolloError?.graphQLErrors;
        ErrorHandler.handleGraphQlError(graphQLErrors, message, handler);
        return this;
    }

    verifyIfAllErrorsAreHandled() {
        let handled = true;
        if (this.apolloError) {
            const { networkError, graphQLErrors } = this.apolloError;
            const unhandledNetworkError = ErrorMarker.isUnhandledError(networkError) && networkError;
            const unhandledGraphQlErrors = graphQLErrors.filter(ErrorMarker.isUnhandledError);
            if (unhandledNetworkError || unhandledGraphQlErrors.length) {
                handled = false;
                console.error('unhandled apollo error', {
                    networkError: unhandledNetworkError || null,
                    graphQLErrors: unhandledGraphQlErrors,
                });
            }
        } else {
            handled = false;
            console.error('unhandled error', this.error);
        }
        return handled;
    }

}
