import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useSessionState } from '../../providers/apollo/cache/session/useSessionState';
import { SignupForm } from './SignupForm';
import { nav } from '../../../config/nav';


export function SignupPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isUserLoggedIn } = useSessionState();

    if (isUserLoggedIn) {
        return <Navigate to={nav.inquiries()} />;
    }

    return (
        <Container maxWidth='xs' disableGutters>

            <Typography component='h1' variant='h5'>
                {t('signupPage.signUp')}
            </Typography>

            <SignupForm formClassName={classes.form} />

            <Grid container direction='row-reverse'>
                <Grid item>
                    <MuiLink to={nav.login()} variant='body2' component={Link}>
                        {t('signupPage.logInLink')}
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
