import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useSessionState } from '../../providers/apollo/cache/session/useSessionState';
import { routes } from '../../../config/routes';
import { SignupForm } from './SignupForm';


export function SignupPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const { isUserLoggedIn } = useSessionState();

    if (isUserLoggedIn) {
        return <Redirect to={routes.projects()} />;
    }

    return (
        <Container maxWidth='xs' disableGutters>

            <Typography component='h1' variant='h5'>
                {t('signupPage.signUp')}
            </Typography>

            <SignupForm formClassName={classes.form} />

            <Grid container direction='row-reverse'>
                <Grid item>
                    <MuiLink to={routes.login()} variant='body2' component={Link}>
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
