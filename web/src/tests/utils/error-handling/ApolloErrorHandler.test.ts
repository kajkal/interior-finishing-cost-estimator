import { GraphQLError } from 'graphql';
import { ApolloError } from '@apollo/client';

import { muteConsole } from '../../__utils__/muteConsole';

import { ApolloErrorHandler } from '../../../code/utils/error-handling/ApolloErrorHandler';


describe('ApolloErrorHandler class', () => {

    const consoleErrorMock = muteConsole('error', (message) => (
        message.startsWith('unhandled apollo error') || message.startsWith('unhandled error')
    ));

    beforeEach(() => {
        consoleErrorMock.mockClear();
    });

    it('should handle all errors', () => {
        const handler = jest.fn();
        const graphQLError1 = new GraphQLError('SAMPLE_ERROR_MESSAGE');
        const apolloError = new ApolloError({
            graphQLErrors: [ graphQLError1 ],
            networkError: null,
        });

        // when
        const handled = ApolloErrorHandler.process(apolloError)
            .handleGraphQlError('SAMPLE_ERROR_MESSAGE', handler)
            .verifyIfAllErrorsAreHandled();

        // then
        expect(handled).toBe(true);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(graphQLError1);
        expect(consoleErrorMock).toHaveBeenCalledTimes(0);
    });

    it('should log unhandled GraphQL errors', () => {
        // given
        const handler = jest.fn();
        const graphQLError1 = new GraphQLError('SAMPLE_ERROR_MESSAGE_1');
        const graphQLError2 = new GraphQLError('SAMPLE_ERROR_MESSAGE_2');
        const apolloError = new ApolloError({
            graphQLErrors: [ graphQLError1, graphQLError2 ],
            networkError: null,
        });

        // when
        const handled = ApolloErrorHandler.process(apolloError)
            .handleGraphQlError('SAMPLE_ERROR_MESSAGE_1', handler)
            .verifyIfAllErrorsAreHandled();

        // then
        expect(handled).toBe(false);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(graphQLError1);
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith('unhandled apollo error', {
            networkError: null,
            graphQLErrors: [ graphQLError2 ],
        });
    });

    it('should log unhandled network error', () => {
        // given
        const handler = jest.fn();
        const networkError = new Error('NETWORK_ERROR');
        const graphQLError = new GraphQLError('SAMPLE_ERROR_MESSAGE');
        const apolloError = new ApolloError({
            graphQLErrors: [ graphQLError ],
            networkError: networkError,
        });

        // when
        const handled = ApolloErrorHandler.process(apolloError)
            .handleGraphQlError('SAMPLE_ERROR_MESSAGE', handler)
            .verifyIfAllErrorsAreHandled();

        // then
        expect(handled).toBe(false);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(graphQLError);
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith('unhandled apollo error', {
            networkError: networkError,
            graphQLErrors: [],
        });
    });

    it('should log unhandled not-ApolloError error', () => {
        // given
        const error = new TypeError(`Cannot read property 'data' of null`);

        // when
        const handled = ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();

        // then
        expect(handled).toBe(false);
        expect(consoleErrorMock).toHaveBeenCalledTimes(1);
        expect(consoleErrorMock).toHaveBeenCalledWith('unhandled error', error);
    });

});
