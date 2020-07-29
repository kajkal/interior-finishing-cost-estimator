import * as apolloClientModule from '@apollo/client';
import * as linkContextModule from '@apollo/link-context';
import { createUploadLink } from 'apollo-upload-client';

import { AuthUtilsSpiesManager } from '../../../../../__utils__/spies-managers/AuthUtilsSpiesManager';
import { ApolloClientSpy } from '../../../../../__utils__/spies-managers/ApolloClientSpy';

import { initApolloClient } from '../../../../../../code/components/providers/apollo/client/initApolloClient';
import { accessTokenVar } from '../../../../../../code/components/providers/apollo/client/accessTokenVar';
import { UnauthorizedError } from '../../../../../../code/utils/auth/UnauthorizedError';


describe('initApolloClient function', () => {

    let setContextSpy: jest.SpiedFunction<typeof linkContextModule.setContext>;
    let createUploadLinkSpy: jest.SpiedFunction<typeof createUploadLink>;

    beforeEach(() => {
        ApolloClientSpy.setupSpies();
        setContextSpy = jest.spyOn(linkContextModule, 'setContext').mockClear();
        createUploadLinkSpy = jest.spyOn(require('apollo-upload-client'), 'createUploadLink') as typeof createUploadLinkSpy;
    });

    afterEach(() => {
        setContextSpy.mockRestore();
        createUploadLinkSpy.mockRestore();
        accessTokenVar(null);
    });

    it('should create ApolloClient', () => {
        const client = initApolloClient();

        // verify produced client
        expect(client).toBeInstanceOf(apolloClientModule.ApolloClient);

        // verify HttpLink/UploadLink
        expect(createUploadLinkSpy).toHaveBeenCalledTimes(1);
        expect(createUploadLinkSpy).toHaveBeenCalledWith({
            uri: 'http://localhost:4000/graphql',
            credentials: 'include',
        });

        // verify AuthLink
        expect(setContextSpy).toHaveBeenCalledTimes(1);
        expect(setContextSpy).toHaveBeenCalledWith(expect.any(Function));

        // verify 'accessTokenVar' value
        expect(accessTokenVar()).toBe(null);
        accessTokenVar('token');
        expect(accessTokenVar()).toBe('token');

        // verify 'on clear store' listener
        ApolloClientSpy.simulateClearStore();
        expect(accessTokenVar()).toBe(null);
    });


    describe('prepare GraphQL request', () => {

        beforeEach(() => {
            AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        });

        const sampleOperation = {
            operationName: 'SampleOperation',
        } as unknown as apolloClientModule.Operation;

        function getPrepareOperationContextFunction() {
            initApolloClient();
            const prepareOperationContextFn = setContextSpy.mock.calls[ 0 ][ 0 ];
            expect(prepareOperationContextFn).toBeInstanceOf(Function);
            return prepareOperationContextFn;
        }

        it('should add auth header only for protected operations', async () => {
            accessTokenVar('ACCESS_TOKEN_FROM_CACHE');
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(false);

            const prepareOperationContextFn = getPrepareOperationContextFunction();
            const context = await prepareOperationContextFn(sampleOperation, {});

            // verify if access token from cache was not verified
            expect(AuthUtilsSpiesManager.verifyAccessToken).toHaveBeenCalledTimes(0);

            // verify if cache was not updated
            expect(accessTokenVar()).toBe('ACCESS_TOKEN_FROM_CACHE');

            // verify if operation context was not updated
            expect(context).toEqual({});
        });

        it('should use valid access token from memory', async () => {
            accessTokenVar('ACCESS_TOKEN_FROM_CACHE');
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockImplementation((token) => token);

            const prepareOperationContextFn = getPrepareOperationContextFunction();
            const context = await prepareOperationContextFn(sampleOperation, {});

            // verify if access token was not refreshed
            expect(AuthUtilsSpiesManager.refreshAccessToken).toHaveBeenCalledTimes(0);

            // verify if cache was not updated
            expect(accessTokenVar()).toBe('ACCESS_TOKEN_FROM_CACHE');

            // verify if operation context was updated
            expect(context).toEqual({
                headers: {
                    authorization: 'Bearer ACCESS_TOKEN_FROM_CACHE',
                },
            });
        });

        it('should refresh token when access token from memory is invalid', async () => {
            accessTokenVar('INVALID_ACCESS_TOKEN_FROM_CACHE');
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(null);
            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('REFRESHED_ACCESS_TOKEN');

            const prepareOperationContextFn = getPrepareOperationContextFunction();
            const context = await prepareOperationContextFn(sampleOperation, {});

            // verify if cache was updated
            expect(accessTokenVar()).toBe('REFRESHED_ACCESS_TOKEN');

            // verify if operation context was updated
            expect(context).toEqual({
                headers: { authorization: 'Bearer REFRESHED_ACCESS_TOKEN' },
            });
        });

        it('should throw en error when the refresh operation returns an error', async (done) => {
            accessTokenVar('INVALID_ACCESS_TOKEN_FROM_CACHE');
            AuthUtilsSpiesManager.isProtectedOperation.mockReturnValue(true);
            AuthUtilsSpiesManager.verifyAccessToken.mockReturnValue(null);
            AuthUtilsSpiesManager.refreshAccessToken.mockImplementation(() => {
                throw new UnauthorizedError('cannot refresh token');
            });

            const prepareOperationContextFn = getPrepareOperationContextFunction();

            try {
                await prepareOperationContextFn(sampleOperation, {});
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedError);
                expect(error).toHaveProperty('message', 'cannot refresh token');

                // verify if cache was not updated
                accessTokenVar('INVALID_ACCESS_TOKEN_FROM_CACHE');
                done();
            }
        });

    });

});
