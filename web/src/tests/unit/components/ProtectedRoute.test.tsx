import * as React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { MockedProvider, MockedResponse } from '@apollo/react-testing';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { MockSnackbarContextData, MockSnackbarProvider } from '../../__utils__/mocks/MockSnackbarProvider';

import { ProtectedRoute } from '../../../code/components/common/router/ProtectedRoute';
import { UnauthorizedError } from '../../../code/services/auth/UnauthorizedError';
import { MeDocument } from '../../../graphql/generated-types';
import { routes } from '../../../code/config/routes';


describe('ProtectedRoute component', () => {

    interface ProtectedRouteRenderOptions {
        history?: MemoryHistory;
        mocks?: ReadonlyArray<MockedResponse>;
        snackbarMocks?: MockSnackbarContextData;
    }

    function renderProtectedRouteWithContext(options: ProtectedRouteRenderOptions): RenderResult {
        const { history = createMemoryHistory(), mocks = [], snackbarMocks } = options;
        history.push('/protected');
        return render(
            <MockedProvider mocks={mocks}>
                <Router history={history}>
                    <MockSnackbarProvider mocks={snackbarMocks}>
                        <Switch>
                            <Route exact path={routes.login()}>
                                login component
                            </Route>
                            <ProtectedRoute exact path='/protected'>
                                protected component
                            </ProtectedRoute>
                        </Switch>
                    </MockSnackbarProvider>
                </Router>
            </MockedProvider>,
        );
    }

    const meSuccessMock = {
        request: {
            query: MeDocument,
        },
        result: {
            data: {
                me: {
                    name: '',
                    email: '',
                    products: [],
                    projects: [],
                    offers: [],
                    '__typename': 'User',
                },
            },
        },
    };

    const meUnauthorizedErrorMock = {
        request: {
            query: MeDocument,
        },
        error: new UnauthorizedError('INVALID_REFRESH_TOKEN'),
    };

    it('should render protected component when user is successfully authenticated', async (done) => {
        const history = createMemoryHistory();
        const mocks = [ meSuccessMock ];
        const { queryByRole, getByText } = renderProtectedRouteWithContext({ history, mocks });

        // verify if progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if protected component is in dom
        expect(getByText('protected component')).toBeInTheDocument();
        done();
    });

    it('should navigate to login page and display warning notification when user is not authenticated', async (done) => {
        const history = createMemoryHistory();
        const mocks = [ meUnauthorizedErrorMock ];
        const snackbarMocks = { warningSnackbar: jest.fn() };
        const { queryByRole, getByText } = renderProtectedRouteWithContext({ history, mocks, snackbarMocks });

        // verify if progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if navigation occurred
        expect(history.location.pathname).toMatch(routes.login());
        expect(getByText('login component')).toBeInTheDocument();

        // verify if warning alert has been displayed
        expect(snackbarMocks.warningSnackbar).toHaveBeenCalledTimes(1);
        expect(snackbarMocks.warningSnackbar).toHaveBeenCalledWith('Authorization required');
        done();
    });


});
