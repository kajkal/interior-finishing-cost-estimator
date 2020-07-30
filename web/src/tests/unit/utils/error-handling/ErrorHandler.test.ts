import { GraphQLError } from 'graphql';

import { UnauthorizedError } from '../../../../code/utils/auth/UnauthorizedError';
import { ErrorHandler } from '../../../../code/utils/error-handling/ErrorHandler';
import { ErrorMarker } from '../../../../code/utils/error-handling/ErrorMarker';


describe('ErrorHandler class', () => {

    describe('handleNetworkError function', () => {

        it('should call handler when network error is defined', () => {
            // given
            const handler = jest.fn();
            const networkError = new Error('NETWORK_ERROR');

            // when
            ErrorHandler.handleNetworkError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(networkError);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(false);
        });

        it('should not call handler when network error is not defined', () => {
            // given
            const handler = jest.fn();
            const networkError1 = undefined;
            const networkError2 = null;

            // when
            ErrorHandler.handleNetworkError(networkError1, handler);
            ErrorHandler.handleNetworkError(networkError2, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError1)).toBe(false);
            expect(ErrorMarker.isUnhandledError(networkError2)).toBe(false);
        });

        it('should not call handler when error is already marked as handled', () => {
            // given
            const handler = jest.fn();
            const networkError = new Error('NETWORK_ERROR');

            // when
            ErrorMarker.markAsHandledError(networkError);
            ErrorHandler.handleNetworkError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(false);
        });

        it('should not call handler when network error is instance of UnauthorizedError', () => {
            // given
            const handler = jest.fn();
            const networkError = new UnauthorizedError('SESSION_EXPIRED');

            // when
            ErrorHandler.handleNetworkError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(true);
        });

    });

    describe('handleUnauthorizedError function', () => {

        it('should call handler when network error is instance of UnauthorizedError', () => {
            // given
            const handler = jest.fn();
            const networkError = new UnauthorizedError('SESSION_EXPIRED');

            // when
            ErrorHandler.handleUnauthorizedError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(networkError);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(false);
        });

        it('should not call handler when network error is not defined', () => {
            // given
            const handler = jest.fn();
            const networkError1 = undefined;
            const networkError2 = null;

            // when
            ErrorHandler.handleUnauthorizedError(networkError1, handler);
            ErrorHandler.handleUnauthorizedError(networkError2, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError1)).toBe(false);
            expect(ErrorMarker.isUnhandledError(networkError2)).toBe(false);
        });

        it('should not call handler when error is already marked as handled', () => {
            // given
            const handler = jest.fn();
            const networkError = new UnauthorizedError('SESSION_EXPIRED');

            // when
            ErrorMarker.markAsHandledError(networkError);
            ErrorHandler.handleUnauthorizedError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(false);
        });

        it('should not call handler when network error is not instance of UnauthorizedError', () => {
            // given
            const handler = jest.fn();
            const networkError = new Error('NETWORK_ERROR');

            // when
            ErrorHandler.handleUnauthorizedError(networkError, handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(networkError)).toBe(true);
        });

    });

    describe('handleGraphQlError function', () => {

        it('should call handler when GraphQL error with matching message is found', () => {
            // given
            const handler = jest.fn();
            const graphQLError1 = new GraphQLError('SAMPLE_ERROR_MESSAGE_1');
            const graphQLError2 = new GraphQLError('SAMPLE_ERROR_MESSAGE_2');
            const graphQLErrors = [ graphQLError1, graphQLError2 ];

            // when
            ErrorHandler.handleGraphQlError(graphQLErrors, 'SAMPLE_ERROR_MESSAGE_2', handler);

            // then
            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(graphQLError2);
            expect(ErrorMarker.isUnhandledError(graphQLError1)).toBe(true);
            expect(ErrorMarker.isUnhandledError(graphQLError2)).toBe(false);
        });

        it('should should not crash when GraphQL errors are not defined', () => {
            // given
            const handler = jest.fn();
            const graphQLErrors1 = undefined;
            const graphQLErrors2 = null;

            // when
            ErrorHandler.handleGraphQlError(graphQLErrors1, 'SAMPLE_ERROR_MESSAGE', handler);
            ErrorHandler.handleGraphQlError(graphQLErrors2, 'SAMPLE_ERROR_MESSAGE', handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
        });

        it('should not call handler when GraphQL error with matching message is not found', () => {
            // given
            const handler = jest.fn();
            const graphQLError1 = new GraphQLError('SAMPLE_ERROR_MESSAGE_1');
            const graphQLError2 = new GraphQLError('SAMPLE_ERROR_MESSAGE_2');
            const graphQLErrors = [ graphQLError1, graphQLError2 ];

            // when
            ErrorHandler.handleGraphQlError(graphQLErrors, 'SAMPLE_ERROR_MESSAGE_3', handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(graphQLError1)).toBe(true);
            expect(ErrorMarker.isUnhandledError(graphQLError2)).toBe(true);
        });

        it('should not call handler when GraphQL error with matching message is already marked as handled', () => {
            // given
            const handler = jest.fn();
            const graphQLError1 = new GraphQLError('SAMPLE_ERROR_MESSAGE_1');
            const graphQLError2 = new GraphQLError('SAMPLE_ERROR_MESSAGE_2');
            const graphQLErrors = [ graphQLError1, graphQLError2 ];

            // when
            ErrorMarker.markAsHandledError(graphQLError1);
            ErrorHandler.handleGraphQlError(graphQLErrors, 'SAMPLE_ERROR_MESSAGE_1', handler);

            // then
            expect(handler).toHaveBeenCalledTimes(0);
            expect(ErrorMarker.isUnhandledError(graphQLError1)).toBe(false);
            expect(ErrorMarker.isUnhandledError(graphQLError2)).toBe(true);
        });

    });

});
