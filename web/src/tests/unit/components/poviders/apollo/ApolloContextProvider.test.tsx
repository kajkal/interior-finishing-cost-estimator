import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { MockSessionChannel } from '../../../../__mocks__/code/MockSessionChannel';
import { AuthUtilsSpiesManager } from '../../../../__utils__/spies-managers/AuthUtilsSpiesManager';
import { ApolloClientSpy } from '../../../../__utils__/spies-managers/ApolloClientSpy';

import * as initApolloClientModule from '../../../../../code/components/providers/apollo/client/initApolloClient';
import { LoginSessionAction, LogoutSessionAction } from '../../../../../code/utils/communication/SessionChannel';
import { UnauthorizedError } from '../../../../../code/components/providers/apollo/errors/UnauthorizedError';
import { SessionActionType } from '../../../../../code/utils/communication/SessionActionType';
import * as generatedTypesModule from '../../../../../graphql/generated-types';


describe('ApolloContextProvider component', () => {

    // isolated components:
    let ApolloContextProvider: React.FunctionComponent;

    let initApolloClientSpy: jest.SpiedFunction<typeof initApolloClientModule.initApolloClient>;
    let useMeLazyQuerySpy: jest.SpiedFunction<typeof generatedTypesModule.useMeLazyQuery>;

    beforeEach(() => {
        ApolloClientSpy.setupSpies();
        AuthUtilsSpiesManager.setupSpiesAndMockImplementations();
        MockSessionChannel.setupMocks();

        // @ts-ignore
        initApolloClientSpy = jest.spyOn(initApolloClientModule, 'initApolloClient');
        useMeLazyQuerySpy = jest.spyOn(generatedTypesModule, 'useMeLazyQuery');
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
        const mockMeQuery = jest.fn();
        useMeLazyQuerySpy.mockReturnValue([ mockMeQuery, { data: { me: {} } } as any ]);

        const { throwError } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        throwError(new UnauthorizedError('NO_EXISTING_SESSION'));

        // verify if provider' children are visible
        expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

        // verify if MeQuery was not triggered
        expect(mockMeQuery).toHaveBeenCalledTimes(0);

        // verify if ApolloClient was initialized with correct initial cache state
        expect(initApolloClientSpy).toHaveBeenCalledTimes(1);
        expect(initApolloClientSpy).toHaveBeenCalledWith({
            sessionState: { accessToken: '' },
        });
    });

    it('should initialize ApolloClient with cache based on existing session state', async () => {
        const mockMeQuery = jest.fn();
        useMeLazyQuerySpy.mockReturnValue([ mockMeQuery, { data: { me: {} } } as any ]);

        const { resolveValue } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        resolveValue('accessTokenTestValue');

        // verify if provider' children are visible
        expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

        // verify if MeQuery was triggered
        expect(mockMeQuery).toHaveBeenCalledTimes(1);

        // verify if ApolloClient was initialized with correct initial cache state
        expect(initApolloClientSpy).toHaveBeenCalledTimes(1);
        expect(initApolloClientSpy).toHaveBeenCalledWith({
            sessionState: { accessToken: 'accessTokenTestValue' },
        });
    });

    it('should display spinner when user session exists and user data are fetching', async () => {
        const mockMeQuery = jest.fn();
        useMeLazyQuerySpy.mockReturnValue([ mockMeQuery, { data: undefined, error: undefined } as any ]);

        const { resolveValue } = deferRefreshAccessTokenPromise();
        renderInMockContext();

        resolveValue('accessTokenTestValue');

        // wait for me query trigger
        await waitFor(() => expect(mockMeQuery).toHaveBeenCalledTimes(1));

        // verify if spinner is visible
        expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
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
                    user: {} as generatedTypesModule.LoginMutation['login']['user'],
                    accessToken: 'accessTokenTestValue',
                },
            };

            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('');
            renderInMockContext();

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            ApolloClientSpy.writeQuery.mockClear();
            MockSessionChannel.simulateSessionEvent(sampleLoginSessionAction);

            // verify if cache was updated for Me query and SessionState
            expect(ApolloClientSpy.writeQuery).toHaveBeenCalledTimes(2);

            // verify if Me query result was saved in cache
            expect(ApolloClientSpy.writeQuery).toHaveBeenNthCalledWith(1, {
                query: generatedTypesModule.MeDocument,
                data: { me: sampleLoginSessionAction.initialData.user },
            });

            // verify if access token was saved in cache
            expect(ApolloClientSpy.writeQuery).toHaveBeenNthCalledWith(2, {
                query: generatedTypesModule.SessionStateDocument,
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

            AuthUtilsSpiesManager.refreshAccessToken.mockResolvedValue('');
            renderInMockContext();

            // verify if provider' children are visible
            expect(await screen.findByTestId('SampleApolloClientConsumer')).toBeInTheDocument();

            MockSessionChannel.simulateSessionEvent(sampleLogoutSessionAction);

            // verify if apollo cache was cleared
            expect(ApolloClientSpy.clearStore).toHaveBeenCalledTimes(1);
        });

    });

});
