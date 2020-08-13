import React from 'react';
import { Location, PartialPath } from 'history';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { LoginForm } from './LoginForm';
import { nav } from '../../../config/nav';


interface LoginPageLocationState {
    from: PartialPath;
}

/**
 * Returns location from requested protected site, or default one.
 * @see ProtectedRoute
 */
function useRequestedLocation(): PartialPath | undefined {
    const { state } = useLocation() as Location<LoginPageLocationState>;
    return state?.from || undefined;
}

export function LoginPage(): React.ReactElement {
    const { t } = useTranslation();
    const requestedLocation = useRequestedLocation();
    const isUserLoggedIn = Boolean(useCurrentUserCachedData());

    if (isUserLoggedIn) {
        return <Navigate to={requestedLocation || nav.profile()} />;
    }

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <PageHeader>
                    <PageTitle>
                        {t('loginPage.logIn')}
                    </PageTitle>
                </PageHeader>

                <LoginForm />

                <Grid container>
                    <Grid item xs>
                        <MuiLink to={nav.forgotPassword()} variant='body2' component={Link}>
                            {t('loginPage.forgotPasswordLink')}
                        </MuiLink>
                    </Grid>
                    <Grid item>
                        <MuiLink to={nav.signup()} variant='body2' component={Link}>
                            {t('loginPage.signUpLink')}
                        </MuiLink>
                    </Grid>
                </Grid>

            </Container>
        </PageEnterTransition>
    );
}
