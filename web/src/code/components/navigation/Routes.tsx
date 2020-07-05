import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ConfirmEmailAddressPage } from '../pages/confirm-email-address/ConfirmEmailAddressPage';
import { PasswordResetRequestPage } from '../pages/password-reset/PasswordResetRequestPage';
import { PasswordResetPage } from '../pages/password-reset/PasswordResetPage';
import { ProtectedRoute } from '../common/router/ProtectedRoute';
import { SignupPage } from '../pages/signup/SignupPage';
import { LogoutPage } from '../pages/logout/LogoutPage';
import { LoginPage } from '../pages/login/LoginPage';
import { routes } from '../../config/routes';

import { TmpMe } from '../../__DEV__/TmpMe';


export function Routes(): React.ReactElement {
    return (
        <Switch>

            {/* Login related */}

            <Route exact path={routes.login()}>
                <LoginPage />
            </Route>

            <Route exact path={routes.forgotPassword()}>
                <PasswordResetRequestPage />
            </Route>

            <Route exact path={routes.passwordReset()}>
                <PasswordResetPage />
            </Route>

            {/* Signup related */}

            <Route exact path={routes.signup()}>
                <SignupPage />
            </Route>

            <Route exact path={routes.confirmEmailAddress()}>
                <ConfirmEmailAddressPage />
            </Route>

            {/* Protected pages */}

            <ProtectedRoute exact path={routes.projects()}>
                <TmpMe />
            </ProtectedRoute>

            <ProtectedRoute exact path='/protected'>
                <h1>hello world</h1>
            </ProtectedRoute>

            <Route exact path={routes.logout()}>
                <LogoutPage />
            </Route>

            {/* Others */}

            <Redirect exact from={routes.home()} to={routes.login()} />

            <Route>
                <span>not found</span>
            </Route>

        </Switch>
    );
}
