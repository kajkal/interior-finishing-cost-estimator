import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocationDescriptorObject } from 'history';
import { Link, Redirect, useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useSessionState } from '../../providers/apollo/cache/session/useSessionState';
import { routes } from '../../../config/routes';
import { LoginForm } from './LoginForm';


interface LoginPageLocationState {
    from: LocationDescriptorObject;
}

/**
 * Returns location from requested protected site, or default one.
 * @see ProtectedRoute
 */
function useRequestedLocation(): LocationDescriptorObject {
    const { state } = useLocation<LoginPageLocationState | null>();
    return state?.from || { pathname: routes.projects() };
}

export function LoginPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isUserLoggedIn } = useSessionState();
    const requestedLocation = useRequestedLocation();

    if (isUserLoggedIn) {
        return <Redirect to={requestedLocation} />;
    }

    return (
        <Container maxWidth='xs' disableGutters>

            <Typography component='h1' variant='h5'>
                {t('loginPage.logIn')}
            </Typography>

            <LoginForm formClassName={classes.form} />

            <Grid container>
                <Grid item xs>
                    <MuiLink to={routes.forgotPassword()} variant='body2' component={Link}>
                        {t('loginPage.forgotPasswordLink')}
                    </MuiLink>
                </Grid>
                <Grid item>
                    <MuiLink to={routes.signup()} variant='body2' component={Link}>
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
