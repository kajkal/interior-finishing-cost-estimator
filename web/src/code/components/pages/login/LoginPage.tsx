import React from 'react';
import { Location, PartialPath } from 'history';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useUserData } from '../../../utils/hooks/useUserData';
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
    const classes = useStyles();
    const { t } = useTranslation();
    const { userData } = useUserData();
    const requestedLocation = useRequestedLocation();

    // redirect when user is already logged in
    if (userData) {
        return <Navigate to={requestedLocation || nav.user(userData.slug).profile()} />;
    }

    return (
        <Container maxWidth='xs' disableGutters>

            <Typography component='h1' variant='h5'>
                {t('loginPage.logIn')}
            </Typography>

            <LoginForm formClassName={classes.form} />

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
    );
}

const useStyles = makeStyles((theme) => ({
    form: {
        marginTop: theme.spacing(1),
    },
}));
