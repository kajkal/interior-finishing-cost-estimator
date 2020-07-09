import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';

import { Routes } from '../../../../code/components/navigation/Routes';
import { routes } from '../../../../code/config/routes';


jest.mock('../../../../code/components/pages/login/LoginPage', () => ({
    LoginPage: () => <div data-testid={'MockLoginPage'} />,
}));

jest.mock('../../../../code/components/pages/password-reset/PasswordResetRequestPage', () => ({
    PasswordResetRequestPage: () => <div data-testid={'MockPasswordResetRequestPage'} />,
}));

jest.mock('../../../../code/components/pages/password-reset/PasswordResetPage', () => ({
    PasswordResetPage: () => <div data-testid={'MockPasswordResetPage'} />,
}));

jest.mock('../../../../code/components/pages/signup/SignupPage', () => ({
    SignupPage: () => <div data-testid={'MockSignupPage'} />,
}));

jest.mock('../../../../code/components/pages/confirm-email-address/ConfirmEmailAddressPage', () => ({
    ConfirmEmailAddressPage: () => <div data-testid={'MockConfirmEmailAddressPage'} />,
}));

jest.mock('../../../../code/components/pages/logout/LogoutPage', () => ({
    LogoutPage: () => <div data-testid={'MockLogoutPage'} />,
}));

describe('Routes component', () => {

    it('should switch between available routes based on active location', () => {
        const history = createMemoryHistory();

        render(
            <Router history={history}>
                <Routes />
            </Router>,
        );

        history.push(routes.login());
        expect(screen.getByTestId('MockLoginPage')).toBeInTheDocument();

        history.push(routes.forgotPassword());
        expect(screen.getByTestId('MockPasswordResetRequestPage')).toBeInTheDocument();

        history.push(routes.passwordReset());
        expect(screen.getByTestId('MockPasswordResetPage')).toBeInTheDocument();

        history.push(routes.signup());
        expect(screen.getByTestId('MockSignupPage')).toBeInTheDocument();

        history.push(routes.confirmEmailAddress());
        expect(screen.getByTestId('MockConfirmEmailAddressPage')).toBeInTheDocument();

        history.push(routes.logout());
        expect(screen.getByTestId('MockLogoutPage')).toBeInTheDocument();
    });

    it('should render not found page when given location not match to any defined route', () => {
        const history = createMemoryHistory({ initialEntries: [ '/not-found' ] });

        render(
            <Router history={history}>
                <Routes />
            </Router>,
        );

        expect(screen.getByText('not found')).toBeInTheDocument();
    });

    it('should redirect from home page to login page', () => {
        const history = createMemoryHistory({ initialEntries: [ routes.home() ] });

        render(
            <Router history={history}>
                <Routes />
            </Router>,
        );

        expect(screen.getByTestId('MockLoginPage')).toBeInTheDocument();
        expect(history.location.pathname).toEqual(routes.login());
    });

});
