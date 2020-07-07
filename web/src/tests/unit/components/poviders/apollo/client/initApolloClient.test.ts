import { Operation } from 'apollo-boost';

import { MockApolloClient } from '../../../../../__mocks__/libraries/apollo.boost';
import { AuthUtilsSpiesManager } from '../../../../../__utils__/spies-managers/AuthUtilsSpiesManager';

import { UnauthorizedError } from '../../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { initApolloClient } from '../../../../../../code/components/providers/apollo/client/initApolloClient';
import { SessionStateDocument } from '../../../../../../graphql/generated-types';


describe('initApolloClient function', () => {

    beforeEach(() => {
        MockApolloClient.setupMocks();
    });

    it('should create ApolloClient with given initial cache state', () => {
        initApolloClient({ sessionState: { accessToken: 'initialAccessTokenValue' } });

        // verify Apollo client creation
        expect(MockApolloClient.constructorFn).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.constructorFn).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
            resolvers: {},
            request: expect.any(Function),
        });

        // verify if cache session data was initialized
        expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.writeQuery).toHaveBeenCalledWith({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    accessToken: 'initialAccessTokenValue',
                },
            },
        });

        // verify if 'on clear store' listener was added
        expect(MockApolloClient.onClearStore).toHaveBeenCalledTimes(1);
        expect(MockApolloClient.onClearStore).toHaveBeenCalledWith(expect.any(Function));

        // verify 'on clear store' listener
        MockApolloClient.simulateClearStore();
        expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(2); // one extra time
    });

    describe('prepare GraphQL request', () => {

        beforeEach(() => {
            AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        });

        function getPrepareRequestFunction() {
            initApolloClient({ sessionState: null! });
            const prepareRequestFn = MockApolloClient.constructorFn.mock.calls[ 0 ][ 0 ].request!;
            expect(prepareRequestFn).toBeInstanceOf(Function);
            MockApolloClient.writeQuery.mockReset(); // write of initial cache data
            return prepareRequestFn;
        }

        function createSampleOperation() {
            return {
                operationName: 'SampleOperation',
                setContext: jest.fn(),
            } as unknown as Operation;
        }

        it('should add auth header only for protected operations', async (done) => {
            MockApolloClient.readQuery.mockReturnValue({ sessionState: { accessToken: 'ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(false);

            const prepareRequest = getPrepareRequestFunction();
            const operation = createSampleOperation();
            await prepareRequest(operation);

            // verify if access token from cache was not verified
            expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(0);

            // verify if cache was not updated
            expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(0);

            // verify if operation context was not updated
            expect(operation.setContext).toHaveBeenCalledTimes(0);
            done();
        });

        it('should use valid access token from memory', async (done) => {
            MockApolloClient.readQuery.mockReturnValue({
                sessionState: { accessToken: 'ACCESS_TOKEN_FROM_CACHE' },
            });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockImplementation((token) => token);

            const prepareRequest = getPrepareRequestFunction();
            const operation = createSampleOperation();
            await prepareRequest(operation);

            // verify if access token was not refreshed
            expect(AuthUtilsSpiesManager.refreshAccessToken).toHaveBeenCalledTimes(0);

            // verify if cache was not updated unnecessarily
            expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(0);

            // verify if operation context was updated
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: 'Bearer ACCESS_TOKEN_FROM_CACHE' },
            });
            done();
        });

        it('should refresh token when access token from memory is invalid', async (done) => {
            MockApolloClient.readQuery.mockReturnValue({ sessionState: { accessToken: 'INVALID_ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(undefined);
            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('REFRESHED_ACCESS_TOKEN');

            const prepareRequest = getPrepareRequestFunction();
            const operation = createSampleOperation();
            await prepareRequest(operation);

            // verify if cache was updated
            expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(1);
            expect(MockApolloClient.writeQuery).toHaveBeenCalledWith({
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
                        accessToken: 'REFRESHED_ACCESS_TOKEN',
                    },
                },
            });

            // verify if operation context was updated
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: 'Bearer REFRESHED_ACCESS_TOKEN' },
            });
            done();
        });

        it('should throw en error when the refresh operation returns an error', async (done) => {
            MockApolloClient.readQuery.mockReturnValue({ sessionState: { accessToken: 'INVALID_ACCESS_TOKEN_FROM_CACHE' } });
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(undefined);
            AuthUtilsSpiesManager.refreshAccessToken.mockImplementation(() => {
                throw new UnauthorizedError('cannot refresh token');
            });

            const prepareRequest = getPrepareRequestFunction();
            const operation = createSampleOperation();

            try {
                await prepareRequest(operation);
            } catch (error) {
                expect(error).toHaveProperty('message', 'cannot refresh token');

                // verify if cache was not updated
                expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(0);

                // verify if operation context was not updated
                expect(operation.setContext).toHaveBeenCalledTimes(0);
                done();
            }
        });

    });

});
