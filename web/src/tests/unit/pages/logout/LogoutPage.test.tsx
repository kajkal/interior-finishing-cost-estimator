import * as React from 'react';
import { createMemoryHistory } from 'history';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { PageContextMocks, PageMockContextProvider } from '../../../__utils__/PageMockContextProvider';
import { ApolloClientSpiesManager } from '../../../__utils__/spies-managers/ApolloClientSpiesManager';

import { LogoutPage } from '../../../../code/components/pages/logout/LogoutPage';
import { LogoutDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('LogoutPage component', () => {

    beforeEach(() => {
        ApolloClientSpiesManager.setupSpies();
    });

    function renderLogoutPageInMockContext(mocks?: PageContextMocks): RenderResult {
        return render(
            <PageMockContextProvider mocks={mocks}>
                <LogoutPage />
            </PageMockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
            request: {
                query: LogoutDocument,
            },
            result: {
                data: {
                    logout: true,
                },
            },
        }),
        networkError: () => ({
            request: {
                query: LogoutDocument,
            },
            error: new Error('network error'),
        }),
    };

    it('should logout on mount and navigate to login page', async (done) => {
        const history = createMemoryHistory();
        const mockResponses = [ mockResponseGenerator.success() ];
        renderLogoutPageInMockContext({ history, mockResponses });

        // verify if navigation occurred
        await waitFor(() => expect(history.location.pathname).toMatch(routes.login()));

        // verify if apollo cache was cleared
        expect(ApolloClientSpiesManager.clearStore).toHaveBeenCalledTimes(1);
        done();
    });

    it('should display notification about network error', async (done) => {
        const history = createMemoryHistory();
        const mockResponses = [ mockResponseGenerator.networkError() ];
        const mockSnackbars = { errorSnackbar: jest.fn() };
        renderLogoutPageInMockContext({ history, mockResponses, mockSnackbars });

        // verify if error alert was displayed
        await waitFor(() => {
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('Network error');
        });
        done();
    });

});
