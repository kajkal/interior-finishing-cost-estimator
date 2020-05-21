import React from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { SignupForm } from './SignupForm';
import { routes } from '../../../config/routes';


export function SignupPage(): React.ReactElement {
    const classes = useStyles();

    return (
        <Container component='main' maxWidth='xs'>

            <Typography component='h1' variant='h5'>
                Sign up
            </Typography>

            <SignupForm formClassName={classes.form} />

            <Grid container direction="row-reverse">
                <Grid item>
                    <MuiLink to={routes.login()} variant='body2' component={Link}>
                        {'Log in instead'}
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
