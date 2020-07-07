import * as React from 'react';
import { createMemoryHistory } from 'history';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { ContextMocks, MockContextProvider } from '../../../__utils__/MockContextProvider';
import { ApolloClientSpiesManager } from '../../../__utils__/spies-managers/ApolloClientSpiesManager';

import { LogoutPage } from '../../../../code/components/pages/logout/LogoutPage';
import { LogoutDocument } from '../../../../graphql/generated-types';
import { routes } from '../../../../code/config/routes';


describe('LogoutPage component', () => {

    beforeEach(() => {
        ApolloClientSpiesManager.setupSpies();
    });

    class LogoutPageTestFixture {
        private constructor(public renderResult: RenderResult) {}
        static renderInMockContext(mocks?: ContextMocks) {
            const renderResult = render(
                <MockContextProvider mocks={mocks}>
                    <LogoutPage />
                </MockContextProvider>,
            );
            return new this(renderResult);
        }
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
        const mockResponse = mockResponseGenerator.success();
        LogoutPageTestFixture.renderInMockContext({ history, mockResponses: [ mockResponse ] });

        // verify if navigation occurred
        await waitFor(() => expect(history.location.pathname).toMatch(routes.login()));

        // verify if apollo cache was cleared
        expect(ApolloClientSpiesManager.clearStore).toHaveBeenCalledTimes(1);
        done();
    });

    it('should display notification about network error', async (done) => {
        const history = createMemoryHistory();
        const mockResponse = mockResponseGenerator.networkError();
        const mockSnackbars = { errorSnackbar: jest.fn() };
        LogoutPageTestFixture.renderInMockContext({ history, mockResponses: [ mockResponse ], mockSnackbars });

        // verify if error alert was displayed
        await waitFor(() => {
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledTimes(1);
            expect(mockSnackbars.errorSnackbar).toHaveBeenCalledWith('t:error.networkError');
        });
        done();
    });

});
