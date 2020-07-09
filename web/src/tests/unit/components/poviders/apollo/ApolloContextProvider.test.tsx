import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { render, screen, waitFor } from '@testing-library/react';

import { AuthUtilsSpiesManager } from '../../../../__utils__/spies-managers/AuthUtilsSpiesManager';
import { MockSessionChannel } from '../../../../__mocks__/code/MockSessionChannel';
import { MockApolloClient } from '../../../../__mocks__/libraries/apollo.boost';

import * as initApolloClientModule from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { LoginSessionAction, LogoutSessionAction } from '../../../../../code/utils/communication/SessionChannel';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { LoginMutation, MeDocument, SessionStateDocument } from '../../../../../graphql/generated-types';
import { SessionActionType } from '../../../../../code/utils/communication/SessionActionType';
import { routes } from '../../../../../code/config/routes';


describe('ApolloContextProvider component', () => {

    // isolated components:
    let ApolloContextProvider: React.FunctionComponent;

    let initApolloClientSpy: jest.SpiedFunction<typeof initApolloClientModule.initApolloClient>;

    beforeEach(() => {
        MockApolloClient.setupMocks();
        AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        MockSessionChannel.setupMocks();

        // @ts-ignore
        initApolloClientSpy = jest.spyOn(initApolloClientModule, 'initApolloClient').mockReturnValue(MockApolloClient);
        initApolloClientSpy.mockClear();
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

    function renderInMockContext(history: MemoryHistory = createMemoryHistory()) {
        jest.isolateModules(() => {
            ApolloContextProvider = require('../../../../../code/components/providers/apollo/ApolloContextProvider').ApolloContextProvider;
        });

        return render(
            <Router history={history}>
                <React.Suspense fallback={<div data-testid='MockSpinner' />}>
                    <ApolloContextProvider>
                        <div data-testid='SampleApolloClientConsumer' />
                    </ApolloContextProvider>
                </React.Suspense>
            </Router>,
        );
    }

    it('should trigger React.Suspense until accessToken value is determined then should initialize Apollo context', async () => {
        const { resolveValue } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        // verify if loader/spinner/progressbar is visible
        expect(screen.getByTestId('MockSpinner')).toBeInTheDocument();

        resolveValue('');

        // verify if provider' children are visible
        expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();
    });

    it('should initialize ApolloClient with default cache', async () => {
        const { throwError } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        throwError(new UnauthorizedError('NO_EXISTING_SESSION'));

        // verify if provider' children are visible
        expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

        // verify if ApolloClient was initialized with correct initial cache state
        expect(initApolloClientSpy).toHaveBeenCalledTimes(1);
        expect(initApolloClientSpy).toHaveBeenCalledWith({
            sessionState: { accessToken: '' },
        });
    });

    it('should initialize ApolloClient with cache based on existing session state', async () => {
        const { resolveValue } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        resolveValue('accessTokenTestValue');

        // verify if provider' children are visible
        expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

        // verify if ApolloClient was initialized with correct initial cache state
        expect(initApolloClientSpy).toHaveBeenCalledTimes(1);
        expect(initApolloClientSpy).toHaveBeenCalledWith({
            sessionState: { accessToken: 'accessTokenTestValue' },
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
            const sampleLoginSessionAction: LoginSessionAction = {
                type: SessionActionType.LOGIN,
                initialData: {
                    __typename: 'InitialData',
                    user: {} as LoginMutation['login']['user'],
                    accessToken: 'accessTokenTestValue',
                },
            };

            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('');
            renderInMockContext();

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            MockSessionChannel.simulateSessionEvent(sampleLoginSessionAction);

            // verify if cache was updated for Me query and SessionState
            expect(MockApolloClient.writeQuery).toHaveBeenCalledTimes(2);

            // verify if Me query result was saved in cache
            expect(MockApolloClient.writeQuery).toHaveBeenNthCalledWith(1, {
                query: MeDocument,
                data: { me: sampleLoginSessionAction.initialData.user },
            });

            // verify if access token was saved in cache
            expect(MockApolloClient.writeQuery).toHaveBeenNthCalledWith(2, {
                query: SessionStateDocument,
                data: {
                    sessionState: {
                        __typename: 'SessionState',
                        accessToken: sampleLoginSessionAction.initialData.accessToken,
                    },
                },
            });
        });

        it('should handle logout session event correctly', async () => {
            const sampleLogoutSessionAction: LogoutSessionAction = {
                type: SessionActionType.LOGOUT,
            };

            const history = createMemoryHistory();
            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('');
            renderInMockContext(history);

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            MockSessionChannel.simulateSessionEvent(sampleLogoutSessionAction);

            // verify if apollo cache was cleared
            expect(MockApolloClient.clearStore).toHaveBeenCalledTimes(1);

            // verify if navigation to login page occurred
            await waitFor(() => expect(history.location.pathname).toBe(routes.login()));
        });

    });

});
