import * as apolloClientModule from '@apollo/client';
import * as linkContextModule from '@apollo/link-context';

import { AuthUtilsSpiesManager } from '../../../../../__utils__/spies-managers/AuthUtilsSpiesManager';
import { ApolloClientSpy } from '../../../../../__utils__/spies-managers/ApolloClientSpy';

import { UnauthorizedError } from '../../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { initApolloClient } from '../../../../../../code/components/providers/apollo/client/initApolloClient';
import { SessionStateDocument } from '../../../../../../graphql/generated-types';


describe('initApolloClient function', () => {

    let setContextSpy: jest.SpiedFunction<typeof linkContextModule.setContext>;
    let createHttpLinkSpy: jest.SpiedFunction<typeof apolloClientModule.createHttpLink>;

    beforeEach(() => {
        ApolloClientSpy.setupSpies();
        setContextSpy = jest.spyOn(linkContextModule, 'setContext');
        createHttpLinkSpy = jest.spyOn(apolloClientModule, 'createHttpLink');
    });

    afterEach(() => {
        setContextSpy.mockRestore();
        createHttpLinkSpy.mockRestore();
    });

    it('should create ApolloClient with given initial cache state', () => {
        const client = initApolloClient({ sessionState: { accessToken: 'initialAccessTokenValue' } });

        // verify produced client
        expect(client).toBeInstanceOf(apolloClientModule.ApolloClient);

        // verify HttpLink
        expect(createHttpLinkSpy).toHaveBeenCalledTimes(1);
        expect(createHttpLinkSpy).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
        });

        // verify AuthLink
        expect(setContextSpy).toHaveBeenCalledTimes(1);
        expect(setContextSpy).toHaveBeenCalledWith(expect.any(Function));

        // verify if cache session data was initialized
        expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(1);
        expect(ApolloClientSpy.writeQuery).toHaveBeenCalledWith({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    accessToken: 'initialAccessTokenValue',
                },
            },
        });

        // verify 'on clear store' listener
        ApolloClientSpy.simulateClearStore();
        expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(2); // one extra time
    });


    describe('prepare GraphQL request', () => {

        beforeEach(() => {
            AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        });

        function getPrepareOperationContextFunction() {
            initApolloClient({ sessionState: null! });
            const prepareOperationContextFn = setContextSpy.mock.calls[ 0 ][ 0 ];
            expect(prepareOperationContextFn).toBeInstanceOf(Function);
            ApolloClientSpy.writeQuery.mockReset(); // write of initial cache data
            return prepareOperationContextFn;
        }

        function createSampleOperation() {
            return {
                operationName: 'SampleOperation',
                setContext: jest.fn(),
            } as unknown as apolloClientModule.Operation;
        }

        it('should add auth header only for protected operations', async () => {
            ApolloClientSpy.readQuery.mockReturnValue({ sessionState: { accessToken: 'ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(false);

            const prepareOperationContext = getPrepareOperationContextFunction();
            const operation = createSampleOperation();
            const context = await prepareOperationContext(operation, {});

            // verify if access token from cache was not verified
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(0);

            // verify if cache was not updated
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(0);

            // verify if operation context was not updated
            expect(context).toEqual({});
        });

        it('should use valid access token from memory', async () => {
            ApolloClientSpy.readQuery.mockReturnValue({
                sessionState: { accessToken: 'ACCESS_TOKEN_FROM_CACHE' },
            });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockImplementation((token) => token);

            const prepareOperationContext = getPrepareOperationContextFunction();
            const operation = createSampleOperation();
            const context = await prepareOperationContext(operation, {});

            // verify if access token was not refreshed
            expect(AuthUtilsSpiesManager.refreshAccessToken).toHaveBeenCalledTimes(0);

            // verify if cache was not updated unnecessarily
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(0);

            // verify if operation context was updated
            expect(context).toEqual({
                headers: { authorization: 'Bearer ACCESS_TOKEN_FROM_CACHE' },
            });
        });

        it('should refresh token when access token from memory is invalid', async () => {
            ApolloClientSpy.readQuery.mockReturnValue({ sessionState: { accessToken: 'INVALID_ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(undefined);
            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('REFRESHED_ACCESS_TOKEN');

            const prepareOperationContext = getPrepareOperationContextFunction();
            const operation = createSampleOperation();
            const context = await prepareOperationContext(operation, {});

            // verify if cache was updated
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(1);
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledWith({
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
                        accessToken: 'REFRESHED_ACCESS_TOKEN',
                    },
                },
            });

            // verify if operation context was updated
            expect(context).toEqual({
                headers: { authorization: 'Bearer REFRESHED_ACCESS_TOKEN' },
            });
        });

        it('should throw en error when the refresh operation returns an error', async (done) => {
            ApolloClientSpy.readQuery.mockReturnValue({ sessionState: { accessToken: 'INVALID_ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(undefined);
            AuthUtilsSpiesManager.refreshAccessToken.mockImplementation(() => {
                throw new UnauthorizedError('cannot refresh token');
            });

            const prepareOperationContext = getPrepareOperationContextFunction();
            const operation = createSampleOperation();

            try {
                await prepareOperationContext(operation, {});
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedError);
                expect(error).toHaveProperty('message', 'cannot refresh token');

                // verify if cache was not updated
                expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(0);
                done();
            }
        });

    });

});
