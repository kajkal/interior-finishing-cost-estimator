import * as React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { MockSnackbarContextData, MockSnackbarProvider } from '../../../__utils__/mocks/MockSnackbarProvider';
import { ApolloClientSpiesManager } from '../../../__utils__/spies-managers/ApolloClientSpiesManager';
import { AuthServiceSpiesManager } from '../../../__utils__/spies-managers/AuthServiceSpiesManager';

import { LogoutPage } from '../../../../code/components/pages/logout/LogoutPage';
import { LogoutDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('LogoutPage component', () => {

    beforeEach(() => {
        ApolloClientSpiesManager.setupSpies();
        AuthServiceSpiesManager.setupSpies();
    });

    interface LogoutPageRenderOptions {
        history?: MemoryHistory;
        mocks?: ReadonlyArray<MockedResponse>;
        snackbarMocks?: MockSnackbarContextData;
    }

    function renderLogoutPageWithContext(options: LogoutPageRenderOptions): RenderResult {
        const { history = createMemoryHistory(), mocks = [], snackbarMocks } = options;
        return render(
            <MockedProvider mocks={mocks}>
                <Router history={history}>
                    <MockSnackbarProvider mocks={snackbarMocks}>
                        <LogoutPage />
                    </MockSnackbarProvider>
                </Router>
            </MockedProvider>,
        );
    }

    const logoutSuccessMock = {
        request: {
            query: LogoutDocument,
        },
        result: {
            data: {
                logout: true,
            },
        },
    };

    const logoutNetworkErrorMock = {
        request: {
            query: LogoutDocument,
        },
        error: new Error('network error'),
    };

    it('should logout on mount and navigate to login page', async (done) => {
        const history = createMemoryHistory();
        const mocks = [ logoutSuccessMock ];
        renderLogoutPageWithContext({ history, mocks });

        // verify if navigation occurred
        await waitFor(() => expect(history.location.pathname).toMatch(routes.login()));

        // verify if apollo cache has been cleared
        expect(ApolloClientSpiesManager.clearStore).toHaveBeenCalledTimes(1);

        // verify if auth service has been informed about access token reset
        expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledTimes(1);
        expect(AuthServiceSpiesManager.setAccessToken).toHaveBeenCalledWith(undefined);
        done();
    });

    it('should display notification about network error', async (done) => {
        const history = createMemoryHistory();
        const mocks = [ logoutNetworkErrorMock ];
        const snackbarMocks = { errorSnackbar: jest.fn() };
        renderLogoutPageWithContext({ history, mocks, snackbarMocks });

        // verify if error alert has been displayed
        await waitFor(() => {
            expect(snackbarMocks.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(snackbarMocks.errorSnackbar).toHaveBeenCalledWith('Network error');
        });
        done();
    });

});
