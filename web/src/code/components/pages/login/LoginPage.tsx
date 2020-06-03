import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { routes } from '../../../config/routes';
import { LoginForm } from './LoginForm';


export function LoginPage(): React.ReactElement {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Container component='main' maxWidth='xs'>

            <Typography component='h1' variant='h5'>
                {t('loginPage.logIn')}
            </Typography>

            <LoginForm formClassName={classes.form} />

            <Grid container>
                <Grid item xs>
                    {/*TODO*/}
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
