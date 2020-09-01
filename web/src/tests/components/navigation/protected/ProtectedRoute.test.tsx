import React from 'react';
import { Location } from 'history';
import { Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { mockUseCurrentUserCachedData } from '../../../__mocks__/code/mockUseCurrentUserCachedData';
import { MockContextProvider } from '../../../__utils__/mocks/MockContextProvider';

import { ProtectedRoute } from '../../../../code/components/navigation/protected/ProtectedRoute';


describe('ProtectedRoute component', () => {

    function renderInMockContext(LoginPageComponent: React.ComponentType, silent?: boolean) {
        return render(
            <MockContextProvider mocks={{ initialEntries: [ '/protected' ] }}>
                <Routes>
                    <Route path='/login'>
                        <LoginPageComponent />
                    </Route>
                    <ProtectedRoute path='/protected' silent={silent}>
                        <div data-testid='ProtectedPage' />
                    </ProtectedRoute>
                </Routes>
            </MockContextProvider>,
        );
    }

    it('should render protected page when user is logged in', () => {
        mockUseCurrentUserCachedData.mockReturnValue({});
        renderInMockContext(() => <div data-testid='LoginPage' />);

        // verify if protected component is visible
        expect(screen.getByTestId('ProtectedPage')).toBeInTheDocument();
    });

    it('should navigate to login page and display warning notification when user is not logged in', () => {
        mockUseCurrentUserCachedData.mockReturnValue(undefined);
        let location!: Location<any>;
        renderInMockContext(() => {
            location = useLocation();
            return <div data-testid='LoginPage' />;
        });

        // verify if login page is visible
        expect(screen.getByTestId('LoginPage')).toBeInTheDocument();

        // verify if location state contains information about protected page path
        expect(location).toBeDefined();
        expect(location.state).toEqual({ from: expect.objectContaining({ pathname: '/protected' }) });

        // verify if toast is visible
        const toast = screen.getByTestId('MockToast');
        expect(toast).toHaveClass('warning');
        expect(toast).toHaveTextContent('t:error.authorizationRequired');
    });

    it('should silently navigate to login page and not display warning notification when silent prop is present', () => {
        mockUseCurrentUserCachedData.mockReturnValue(undefined);
        let location!: Location<any>;
        renderInMockContext(() => {
            location = useLocation();
            return <div data-testid='LoginPage' />;
        }, true);

        // verify if login page is visible
        expect(screen.getByTestId('LoginPage')).toBeInTheDocument();

        // verify if location state is not defined
        expect(location).toBeDefined();
        expect(location.state).toBe(null);

        // verify if toast is not visible
        expect(screen.queryByTestId('MockToast')).toBeNull();
    });

});
