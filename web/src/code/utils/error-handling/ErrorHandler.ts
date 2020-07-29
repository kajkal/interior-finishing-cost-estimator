import { GraphQLError } from 'graphql';

import { UnauthorizedError } from '../auth/UnauthorizedError';
import { ErrorMarker } from './ErrorMarker';
import { Handler } from './Handler';


export class ErrorHandler {

    /**
     * Handler for any network errors other than UnauthorizedErrors
     */
    static handleNetworkError<T extends Error>(networkError: T | undefined | null, handler: Handler<T>) {
        if (networkError && ErrorMarker.isUnhandledError(networkError) && !(networkError instanceof UnauthorizedError)) {
            ErrorMarker.markAsHandledError(networkError);
            handler(networkError);
        }
    }

    /**
     * Handler for UnauthorizedErrors, thrown when user session expired.
     */
    static handleUnauthorizedError<T extends Error>(networkError: T | undefined | null, handler: Handler<UnauthorizedError>) {
        if (networkError && ErrorMarker.isUnhandledError(networkError) && (networkError instanceof UnauthorizedError)) {
            ErrorMarker.markAsHandledError(networkError);
            handler(networkError);
        }
    }

    /**
     * Handler for GraphQL error with given message.
     */
    static handleGraphQlError(graphQLErrors: readonly GraphQLError[] | undefined | null, message: string, handler: Handler<GraphQLError>) {
        if (graphQLErrors?.length) {
            const matchingError = graphQLErrors
                .filter(ErrorMarker.isUnhandledError)
                .find((error) => message === error.message);
            if (matchingError) {
                ErrorMarker.markAsHandledError(matchingError);
                handler(matchingError);
            }
        }
    }

}
