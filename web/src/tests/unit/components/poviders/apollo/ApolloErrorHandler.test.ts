import { ApolloError } from 'apollo-boost';
import { GraphQLError } from 'graphql';
import { ApolloErrorHandler } from '../../../../../code/components/providers/apollo/errors/ApolloErrorHandler';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';


describe('ApolloErrorHandler class ', () => {

    describe('GraphQL error', () => {

        it('should not call handler when no error is found', () => {
            // given
            const mockHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [],
                networkError: null,
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleGraphQlErrors({
                    'SAMPLE_ERROR_MESSAGE': mockHandler,
                })
                .finish();

            // then
            expect(handled).toBe(false);
            expect(mockHandler).toHaveBeenCalledTimes(0);
        });

        it('should call handler when error is matched to handler', () => {
            // given
            const mockHandler = jest.fn();
            const mockOtherHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [ { message: 'SAMPLE_ERROR_MESSAGE' } as unknown as GraphQLError ],
                networkError: null,
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleGraphQlErrors({
                    'SAMPLE_ERROR_MESSAGE': mockHandler,
                    'OTHER_ERROR_MESSAGE': mockOtherHandler,
                })
                .finish();

            // then
            expect(handled).toBe(true);
            expect(mockHandler).toHaveBeenCalledTimes(1);
            expect(mockHandler).toHaveBeenCalledWith({ message: 'SAMPLE_ERROR_MESSAGE' });
            expect(mockOtherHandler).toHaveBeenCalledTimes(0);
        });

        it('should log an error when error is not matched to any handler', () => {
            // given
            const mockHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [ { message: 'UNHANDLED_ERROR' } as unknown as GraphQLError ],
                networkError: null,
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleGraphQlErrors({
                    'SAMPLE_ERROR_MESSAGE': mockHandler,
                })
                .finish();

            // then
            expect(handled).toBe(false);
            expect(mockHandler).toHaveBeenCalledTimes(0);
        });

    });

    describe('Network and Unauthorized error', () => {

        it('should not call handler when no network error is found', () => {
            // given
            const mockNetworkErrorHandler = jest.fn();
            const mockUnauthorizedErrorHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [],
                networkError: null,
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleNetworkError(mockNetworkErrorHandler)
                .handleUnauthorizedError(mockUnauthorizedErrorHandler)
                .finish();

            // then
            expect(handled).toBe(false);
            expect(mockNetworkErrorHandler).toHaveBeenCalledTimes(0);
            expect(mockUnauthorizedErrorHandler).toHaveBeenCalledTimes(0);
        });

        it('should call unauthorizedErrorHandler when network error is instanceof UnauthorizedError', () => {
            // given
            const mockNetworkErrorHandler = jest.fn();
            const mockUnauthorizedErrorHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [],
                networkError: new UnauthorizedError('INVALID_REFRESH_TOKEN'),
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleNetworkError(mockNetworkErrorHandler)
                .handleUnauthorizedError(mockUnauthorizedErrorHandler)
                .finish();

            // then
            expect(handled).toBe(true);
            expect(mockNetworkErrorHandler).toHaveBeenCalledTimes(0);
            expect(mockUnauthorizedErrorHandler).toHaveBeenCalledTimes(1);
            expect(mockUnauthorizedErrorHandler).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('should call networkErrorHandler when network error is not instanceof UnauthorizedError', () => {
            // given
            const mockNetworkErrorHandler = jest.fn();
            const mockUnauthorizedErrorHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [],
                networkError: new Error('FAILED_TO_FETCH'),
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .handleNetworkError(mockNetworkErrorHandler)
                .handleUnauthorizedError(mockUnauthorizedErrorHandler)
                .finish();

            // then
            expect(handled).toBe(true);
            expect(mockNetworkErrorHandler).toHaveBeenCalledTimes(1);
            expect(mockNetworkErrorHandler).toHaveBeenCalledWith(expect.any(Error));
            expect(mockUnauthorizedErrorHandler).toHaveBeenCalledTimes(0);
        });

        it('should log an error when network error is not matched to any handler', () => {
            // given
            const mockHandler = jest.fn();
            const error = new ApolloError({
                graphQLErrors: [],
                networkError: new Error('UNHANDLED_ERROR'),
            });

            // when
            const handled = ApolloErrorHandler.process(error)
                .finish();

            // then
            expect(handled).toBe(false);
            expect(mockHandler).toHaveBeenCalledTimes(0);
        });

    });

});