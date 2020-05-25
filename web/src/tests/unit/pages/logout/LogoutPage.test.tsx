import * as React from 'react';
import { createMemoryHistory } from 'history';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
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

    function renderLogoutPageInMockContext(mocks?: PageContextMocks): RenderResult {
        return render(
            <PageMockContextProvider mocks={mocks}>
                <LogoutPage />
            </PageMockContextProvider>,
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
        renderLogoutPageInMockContext({ history, mocks });

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
        renderLogoutPageInMockContext({ history, mocks, snackbarMocks });

        // verify if error alert has been displayed
        await waitFor(() => {
            expect(snackbarMocks.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(snackbarMocks.errorSnackbar).toHaveBeenCalledWith('Network error');
        });
        done();
    });

});
