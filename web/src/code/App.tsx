import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { TmpMe } from './TmpMe';
import { LogoutPage } from './components/pages/logout/LogoutPage';
import { LoginPage } from './components/pages/login/LoginPage';
import { SignupPage } from './components/pages/signup/SignupPage';
import { routes } from './config/routes';
import { ProtectedRoute } from './components/common/router/ProtectedRoute';
import { ConfirmEmailAddressPage } from './components/pages/confirm-email-address/ConfirmEmailAddressPage';
import { PasswordResetPage } from './components/pages/password-reset/PasswordResetPage';
import { PasswordResetRequestPage } from './components/pages/password-reset/PasswordResetRequestPage';
import { Layout } from './components/layout/Layout';


export function App(): React.ReactElement {
    return (
        <Layout>
            {/*<Breadcrumbs aria-label='breadcrumb'>*/}

            {/*    <MuiLink to={routes.login()} component={Link}>*/}
            {/*        Log in*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to={routes.forgotPassword()} component={Link}>*/}
            {/*        --Forgot password--*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to={'/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWRkNzBhYTkwZTAyMjQwYzQ4MWVhYmMiLCJpYXQiOjE1OTE5OTQ1ODUsImV4cCI6MTU5MjAwMTc4NX0.a_z0oLDGseLxX5KD4tLliYsix05_dMfp1CUwCG5E1VQ'} component={Link}>*/}
            {/*        --Password reset--*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to={routes.signup()} component={Link}>*/}
            {/*        Sign up*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to={routes.projects()} component={Link}>*/}
            {/*        Projects*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to='/protected' component={Link}>*/}
            {/*        Protected*/}
            {/*    </MuiLink>*/}

            {/*    <MuiLink to={routes.logout()} component={Link}>*/}
            {/*        Logout*/}
            {/*    </MuiLink>*/}

            {/*</Breadcrumbs>*/}

            {/*<h1>{t('common.appName')}</h1>*/}

            <Switch>

                <Route exact path={routes.login()}>
                    <LoginPage />
                </Route>

                <Route exact path={routes.forgotPassword()}>
                    <PasswordResetRequestPage />
                </Route>

                <Route exact path={routes.passwordReset()}>
                    <PasswordResetPage />
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
        </Layout>
    );
}
