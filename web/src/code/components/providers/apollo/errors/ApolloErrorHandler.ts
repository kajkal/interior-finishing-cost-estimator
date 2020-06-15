import { GraphQLError } from 'graphql';
import { ApolloError } from 'apollo-boost';

import { UnauthorizedError } from './UnauthorizedError';


export type ErrorHandler<T extends Error> = (error: T) => void;

/**
 * Helper class responsible for GraphQL errors handling.
 */
export class ApolloErrorHandler {

    private constructor(private readonly error: ApolloError, private handled: boolean = false) {
    }

    static process(error: Error): ApolloErrorHandler {
        return new this(error as ApolloError);
    }

    /**
     * Handler for GraphQL errors.
     * Accepts object with errorMessage -> handler function.
     */
    handleGraphQlErrors(handler: Record<string, ErrorHandler<GraphQLError>>): ApolloErrorHandler {
        const firstGraphQLError = this.error.graphQLErrors[ 0 ];
        if (firstGraphQLError) {
            const matchingErrorHandler = handler[ firstGraphQLError?.message ] as ErrorHandler<GraphQLError> | undefined;
            if (matchingErrorHandler) {
                matchingErrorHandler(firstGraphQLError);
                this.handled = true;
            }
            if (!this.handled && firstGraphQLError?.message === 'Argument Validation Error') {
                console.log('unexpected argument validation error', firstGraphQLError);
            }
        }
        return this;
    }

    /**
     * Handler for UnauthorizedErrors, thrown when user session expired.
     */
    handleUnauthorizedError(errorHandler: ErrorHandler<UnauthorizedError>): ApolloErrorHandler {
        const { networkError } = this.error;
        if (networkError instanceof UnauthorizedError) {
            errorHandler(networkError);
            this.handled = true;
        }
        return this;
    }

    /**
     * Handler for any network errors other than UnauthorizedErrors
     */
    handleNetworkError(errorHandler: ErrorHandler<Error>): ApolloErrorHandler {
        const { networkError } = this.error;
        if (networkError && !(networkError instanceof UnauthorizedError)) {
            errorHandler(networkError);
            this.handled = true;
        }
        return this;
    }

    finish(): boolean {
        if (!this.handled) {
            console.error('unhandled error', this.error);
        }
        return this.handled;
    }

}
