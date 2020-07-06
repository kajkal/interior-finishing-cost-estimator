import { TokenExpiredError } from 'jsonwebtoken';
import { InMemoryCache, Operation } from 'apollo-boost';

import { ApolloCacheSpiesManager } from '../../../../__utils__/spies-managers/ApolloCacheSpiesManager';
import { TokenVerifierSpy } from '../../../../__utils__/spies-managers/TokenVerifierSpy';

import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { SessionStateDocument, SessionStateQuery } from '../../../../../graphql/generated-types';
import { AuthUtils } from '../../../../../code/components/providers/apollo/auth/AuthUtils';


describe('AuthUtils class', () => {

    let apolloCache: InMemoryCache;
    let fetchSpy: jest.SpiedFunction<() => Promise<Partial<Response>>>;

    beforeEach(() => {
        apolloCache = new InMemoryCache();
        // @ts-ignore
        fetchSpy = jest.spyOn(global, 'fetch').mockImplementation();
        ApolloCacheSpiesManager.setupSpies();
        TokenVerifierSpy.setupSpiesAndMockImplementations();
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    function setApolloCacheLocalStateAccessToken(token: string) {
        apolloCache.writeQuery<SessionStateQuery>({
            query: SessionStateDocument,
            data: {
                sessionState: {
                    __typename: 'SessionState',
                    accessToken: token,
                },
            },
        });
        ApolloCacheSpiesManager.writeQuery.mockClear();
    }

    function createSampleOperation(operationName: string = 'SampleProtectedOperation') {
        return {
            operationName,
            setContext: jest.fn(),
            getContext: jest.fn().mockReturnValue({ cache: apolloCache }),
        } as unknown as Operation;
    }

    const mockFetchManager = {
        mockSuccess(fetchedAccessToken: string) {
            fetchSpy.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ accessToken: fetchedAccessToken }),
            });
        },
        mockFailure(errorMessage: string) {
            fetchSpy.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ errorMessage }),
            });
        },
        networkError() {
            fetchSpy.mockRejectedValue(new Error('network error'));
        },
    };

    describe('prepare request', () => {

        function verifyIfTokenWasSavedInCacheAndAddedToAuthHeader(expectedToken: string, operation: Operation) {
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(1);
            expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledWith({
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
                        accessToken: expectedToken,
                    },
                },
            });
            expect(operation.setContext).toHaveBeenCalledTimes(1);
            expect(operation.setContext).toHaveBeenCalledWith({
                headers: { authorization: `Bearer ${expectedToken}` },
            });
        }

        it('should add auth header only for protected operations', async (done) => {
            // given
            const publicOperations = [ 'Login', 'Register', 'Logout', 'ConfirmEmailAddress' ];

            // when/then
            await Promise.all(publicOperations.map(async (operationName: string) => {
                const operation = createSampleOperation(operationName);
                await AuthUtils.prepareRequest(operation);
                expect(operation.getContext).toHaveBeenCalledTimes(0);
                expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
            }));
            expect(fetchSpy).toHaveBeenCalledTimes(0);
            done();
        });

        it('should use valid access token from memory', async (done) => {
            // given
            const accessTokenFromMemory = 'ACCESS_TOKEN_FROM_MEMORY_TEST_VALUE';
            const operation = createSampleOperation();

            // when
            setApolloCacheLocalStateAccessToken(accessTokenFromMemory);
            await AuthUtils.prepareRequest(operation);

            // then
            expect(ApolloCacheSpiesManager.readQuery).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledTimes(0);
            verifyIfTokenWasSavedInCacheAndAddedToAuthHeader(accessTokenFromMemory, operation);
            done();
        });

        it('should refresh token when access token from memory has expired', async (done) => {
            // given
            TokenVerifierSpy.verifyTokenExpiration.mockImplementation(() => {
                throw new TokenExpiredError('TOKEN_EXPIRED', new Date());
            });
            const accessTokenFromMemory = 'ACCESS_TOKEN_FROM_MEMORY_TEST_VALUE';
            const accessTokenFromRefreshOperation = 'ACCESS_TOKEN_FROM_REFRESH_OPERATION_TEST_VALUE';
            const operation = createSampleOperation();

            // when
            mockFetchManager.mockSuccess(accessTokenFromRefreshOperation);
            setApolloCacheLocalStateAccessToken(accessTokenFromMemory);
            await AuthUtils.prepareRequest(operation);

            // then
            expect(ApolloCacheSpiesManager.readQuery).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledWith(expect.stringMatching('http://localhost:4000/refresh_token'), {
                method: 'POST',
                credentials: 'include',
            });
            verifyIfTokenWasSavedInCacheAndAddedToAuthHeader(accessTokenFromRefreshOperation, operation);
            done();
        });

        it('should refresh token when there is no available access token in memory', async (done) => {
            // given
            const accessTokenFromRefreshOperation = 'ACCESS_TOKEN_FROM_REFRESH_OPERATION_TEST_VALUE';
            const operation = createSampleOperation();

            // when
            mockFetchManager.mockSuccess(accessTokenFromRefreshOperation);
            setApolloCacheLocalStateAccessToken('');
            await AuthUtils.prepareRequest(operation);

            // then
            expect(ApolloCacheSpiesManager.readQuery).toHaveBeenCalledTimes(1);
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            verifyIfTokenWasSavedInCacheAndAddedToAuthHeader(accessTokenFromRefreshOperation, operation);
            done();
        });

        it('should throw an error when the refresh operation returns an error', async (done) => {
            // given
            const errorMessage = 'invalid refresh token';
            const operation = createSampleOperation();

            try {
                // when
                mockFetchManager.mockFailure(errorMessage);
                setApolloCacheLocalStateAccessToken('');
                await AuthUtils.prepareRequest(operation);
            } catch (error) {
                // then
                expect(ApolloCacheSpiesManager.readQuery).toHaveBeenCalledTimes(1);
                expect(error).toBeInstanceOf(UnauthorizedError);
                expect(error).toHaveProperty('message', errorMessage);
                expect(fetchSpy).toHaveBeenCalledTimes(1);
                expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
                done();
            }
        });

        it('should throw an error when server is not accessible', async (done) => {
            // given
            const operation = createSampleOperation();

            try {
                // when
                mockFetchManager.networkError();
                setApolloCacheLocalStateAccessToken('');
                await AuthUtils.prepareRequest(operation);
            } catch (error) {
                // then
                expect(ApolloCacheSpiesManager.readQuery).toHaveBeenCalledTimes(1);
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty('message', 'network error');
                expect(fetchSpy).toHaveBeenCalledTimes(1);
                expect(ApolloCacheSpiesManager.writeQuery).toHaveBeenCalledTimes(0);
                expect(operation.setContext).toHaveBeenCalledTimes(0);
                done();
            }
        });

    });

});
