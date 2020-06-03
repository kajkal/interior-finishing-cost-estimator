import React from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TmpMe } from './TmpMe';
import { LogoutPage } from './components/pages/logout/LogoutPage';
import { LoginPage } from './components/pages/login/LoginPage';
import { SignupPage } from './components/pages/signup/SignupPage';
import { routes } from './config/routes';
import { ProtectedRoute } from './components/common/router/ProtectedRoute';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';
import { ConfirmEmailAddressPage } from './components/pages/confirm-email-address/ConfirmEmailAddressPage';
import { LanguageMenu } from './components/common/language-menu/LanguageMenu';


export function App(): React.ReactElement {
    const { t } = useTranslation();

    return (
        <>
            <Breadcrumbs aria-label='breadcrumb'>

                <MuiLink to={routes.login()} component={Link}>
                    Log in
                </MuiLink>

                <MuiLink to={routes.signup()} component={Link}>
                    Sign up
                </MuiLink>

                <MuiLink to={routes.projects()} component={Link}>
                    Projects
                </MuiLink>

                <MuiLink to='/protected' component={Link}>
                    Protected
                </MuiLink>

                <MuiLink to={routes.logout()} component={Link}>
                    Logout
                </MuiLink>

            </Breadcrumbs>

            <LanguageMenu />

            <h1>{t('common.appName')}</h1>

            <Switch>

                <Route exact path={routes.login()}>
                    <LoginPage />
                </Route>

                <Route exact path={routes.signup()}>
                    <SignupPage />
                </Route>

                <Route exact path={routes.confirmEmailAddress()}>
                    <ConfirmEmailAddressPage />
                </Route>

                <ProtectedRoute exact path={routes.projects()}>
                    <TmpMe />
                </ProtectedRoute>

                <ProtectedRoute exact path='/protected'>
                    <h1>hello world</h1>
                </ProtectedRoute>

                <Route exact path={routes.logout()}>
                    <LogoutPage />
                </Route>

                <Redirect exact from={routes.home()} to={routes.login()} />

                <Route>
                    <span>not found</span>
                </Route>

            </Switch>
        </>
    );
}
