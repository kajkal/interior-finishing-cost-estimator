import React from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { TmpMe } from './TmpMe';
import { LogoutPage } from './components/pages/logout/LogoutPage';
import { LoginPage } from './components/pages/login/LoginPage';
import { SignupPage } from './components/pages/signup/SignupPage';
import { routes } from './config/routes';
import { ProtectedRoute } from './components/common/router/ProtectedRoute';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import MuiLink from '@material-ui/core/Link';


export function App(): React.ReactElement {
    return (
        <>
            <Breadcrumbs aria-label="breadcrumb">

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

            <Switch>

                <Route exact path={routes.login()}>
                    <LoginPage />
                </Route>

                <Route exact path={routes.signup()}>
                    <SignupPage />
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
