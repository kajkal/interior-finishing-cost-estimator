import React from 'react';
import { NetworkStatus } from '@apollo/client';
import { render, screen } from '@testing-library/react';

import { MockSessionChannel } from '../../../../__mocks__/code/MockSessionChannel';
import { AuthUtilsSpiesManager } from '../../../../__utils__/spies-managers/AuthUtilsSpiesManager';
import { ApolloClientSpy } from '../../../../__utils__/spies-managers/ApolloClientSpy';

import * as initApolloClientModule from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { LoginSessionAction, LogoutSessionAction } from '../../../../../code/utils/communication/SessionChannel';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { accessTokenVar } from '../../../../../code/components/providers/apollo/client/accessTokenVar';
import { SessionActionType } from '../../../../../code/utils/communication/SessionActionType';
import {LoginMutation, MeDocument } from '../../../../../graphql/generated-types';


describe('ApolloContextProvider component', () => {

    // isolated components:
    let ApolloContextProvider: React.FunctionComponent;

    let initApolloClientSpy: jest.SpiedFunction<typeof initApolloClientModule.initApolloClient>;

    beforeEach(() => {
        ApolloClientSpy.setupSpies();
        AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        MockSessionChannel.setupMocks();

        // @ts-ignore
        initApolloClientSpy = jest.spyOn(initApolloClientModule, 'initApolloClient');
        initApolloClientSpy.mockClear();

        accessTokenVar(null);
    });

    function deferRefreshAccessTokenPromise() {
        let resolveValue!: (value: string) => void;
        let throwError!: (error: UnauthorizedError) => void;

        AuthUtilsSpiesManager.refreshAccessToken.mockReturnValue(new Promise((resolve, reject) => {
            resolveValue = (value) => resolve(value);
            throwError = (error) => reject(error);
        }));

        return { resolveValue, throwError };
    }

    function renderInMockContext() {
        jest.isolateModules(() => {
            ({ ApolloContextProvider } = require('../../../../../code/components/providers/apollo/ApolloContextProvider'));
        });

        return render(
            <React.Suspense fallback={<div data-testid='MockSpinner' />}>
                <ApolloContextProvider>
                    <div data-testid='SampleApolloClientConsumer' />
                </ApolloContextProvider>
            </React.Suspense>,
        );
    }

    describe('should trigger React.Suspense until initial app state is determined', () => {

        it('when user is already logged in and MeQuery returned data', async () => {
            ApolloClientSpy.query.mockResolvedValue({ loading: false, networkStatus: NetworkStatus.ready });
            const { resolveValue } = deferRefreshAccessTokenPromise();
            renderInMockContext();

            // verify if loader/spinner/progressbar is visible
            expect(screen.getByTestId('MockSpinner')).toBeInTheDocument();

            resolveValue('REFRESHED_ACCESS_TOKEN');

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            // verify if MeQuery was triggered
            expect(ApolloClientSpy.query).toHaveBeenCalledTimes(1);
            expect(ApolloClientSpy.query).toHaveBeenCalledWith({ query: MeDocument });

            // verify accessToken cache value
            expect(accessTokenVar()).toBe('REFRESHED_ACCESS_TOKEN');
        });

        it('when user is already logged in and MeQuery returned error', async () => {
            ApolloClientSpy.query.mockImplementation(() => {
                throw new Error('sth broke');
            });
            const { resolveValue } = deferRefreshAccessTokenPromise();
            renderInMockContext();

            // verify if loader/spinner/progressbar is visible
            expect(screen.getByTestId('MockSpinner')).toBeInTheDocument();

            resolveValue('REFRESHED_ACCESS_TOKEN');

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            // verify if MeQuery was triggered
            expect(ApolloClientSpy.query).toHaveBeenCalledTimes(1);
            expect(ApolloClientSpy.query).toHaveBeenCalledWith({ query: MeDocument });

            // verify accessToken cache value
            expect(accessTokenVar()).toBe(null);
        });

        it('when user is not already logged in', async () => {
            const { throwError } = deferRefreshAccessTokenPromise();
            renderInMockContext();

            // verify if loader/spinner/progressbar is visible
            expect(screen.getByTestId('MockSpinner')).toBeInTheDocument();

            throwError(new UnauthorizedError('NO_EXISTING_SESSION'));

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            // verify if MeQuery was not triggered
            expect(ApolloClientSpy.query).toHaveBeenCalledTimes(0);

            // verify accessToken cache value
            expect(accessTokenVar()).toBe(null);
        });

    });

    describe('session state synchronization', () => {

        it('should add session event listener on mount and remove session event listener on unmount', async () => {
            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('');
            const { unmount } = renderInMockContext();

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            // verify if session event listener was added
            expect(MockSessionChannel.addSessionEventListener).toHaveBeenCalledTimes(1);
            expect(MockSessionChannel.removeSessionEventListener).toHaveBeenCalledTimes(0);

            unmount();

            // verify if session event listener was removed
            expect(MockSessionChannel.removeSessionEventListener).toHaveBeenCalledTimes(1);
        });

        it('should handle login session event correctly', async () => {
            const { throwError } = deferRefreshAccessTokenPromise();
            const sampleLoginSessionAction: LoginSessionAction = {
                type: SessionActionType.LOGIN,
                initialData: {
                    __typename: 'InitialData',
                    user: {} as LoginMutation['login']['user'],
                    accessToken: 'ACCESS_TOKEN_FROM_LOGIN_EVENT',
                },
            };

            renderInMockContext();
            throwError(new UnauthorizedError('NO_EXISTING_SESSION'));

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            // verify initial accessToken cache value
            expect(accessTokenVar()).toBe(null);

            MockSessionChannel.simulateSessionEvent(sampleLoginSessionAction);

            // verify if Me query result was saved in cache
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(1);
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledWith({
                query: MeDocument,
                data: { me: sampleLoginSessionAction.initialData.user },
            });

            // verify if access token was saved in cache
            expect(accessTokenVar()).toBe('ACCESS_TOKEN_FROM_LOGIN_EVENT');
        });

        it('should handle logout session event correctly', async () => {
            ApolloClientSpy.query.mockResolvedValue({ loading: false, networkStatus: NetworkStatus.ready });
            const { resolveValue } = deferRefreshAccessTokenPromise();
            const sampleLogoutSessionAction: LogoutSessionAction = {
                type: SessionActionType.LOGOUT,
            };

            renderInMockContext();
            resolveValue('REFRESHED_ACCESS_TOKEN');

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            MockSessionChannel.simulateSessionEvent(sampleLogoutSessionAction);

            // verify if apollo cache was cleared
            expect(ApolloClientSpy.clearStore).toHaveBeenCalledTimes(1);
        });

    });

});
