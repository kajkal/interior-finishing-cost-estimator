import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, RenderResult, waitFor } from '@testing-library/react';

import { ProtectedRoute } from '../../../code/components/common/router/ProtectedRoute';
import { UnauthorizedError } from '../../../code/services/auth/UnauthorizedError';
import { MeDocument } from '../../../graphql/generated-types';
import { routes } from '../../../code/config/routes';
import { PageContextMocks, PageMockContextProvider } from '../../__utils__/PageMockContextProvider';


describe('ProtectedRoute component', () => {

    const protectedRoute = '/protected'; // initial location

    function renderProtectedRouteInMockContext(mocks?: PageContextMocks): RenderResult {
        return render(
            <PageMockContextProvider mocks={mocks}>
                <Switch>
                    <Route exact path={routes.login()}>
                        login component
                    </Route>
                    <ProtectedRoute exact path={protectedRoute}>
                        protected component
                    </ProtectedRoute>
                </Switch>
            </PageMockContextProvider>,
        );
    }

    const mockResponseGenerator = {
        success: () => ({
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
        }),
        unauthorizedError: () => ({
            request: {
                query: MeDocument,
            },
            error: new UnauthorizedError('INVALID_REFRESH_TOKEN'),
        }),
    };

    it('should render protected component when user is successfully authenticated', async (done) => {
        const history = createMemoryHistory({ initialEntries: [ protectedRoute ] });
        const mockResponses = [ mockResponseGenerator.success() ];
        const { queryByRole, getByText } = renderProtectedRouteInMockContext({ history, mockResponses });

        // verify if progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if protected component is in dom
        expect(getByText('protected component')).toBeInTheDocument();
        done();
    });

    it('should navigate to login page and display warning notification when user is not authenticated', async (done) => {
        const history = createMemoryHistory({ initialEntries: [ protectedRoute ] });
        const mockResponses = [ mockResponseGenerator.unauthorizedError() ];
        const mockSnackbars = { warningSnackbar: jest.fn() };
        const { queryByRole, getByText } = renderProtectedRouteInMockContext({ history, mockResponses, mockSnackbars });

        // verify if progressbar is visible
        expect(queryByRole('progressbar', { hidden: true })).toBeInTheDocument();

        // wait for progress bar to disappear
        await waitFor(() => expect(queryByRole('progressbar', { hidden: true })).toBe(null));

        // verify if navigation occurred
        expect(history.location.pathname).toMatch(routes.login());
        expect(getByText('login component')).toBeInTheDocument();

        // verify if warning alert has been displayed
        expect(mockSnackbars.warningSnackbar).toHaveBeenCalledTimes(1);
        expect(mockSnackbars.warningSnackbar).toHaveBeenCalledWith('Authorization required');
        done();
    });

});
