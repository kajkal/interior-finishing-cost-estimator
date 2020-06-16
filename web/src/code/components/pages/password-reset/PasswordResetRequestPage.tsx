import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { PasswordResetRequestForm } from './PasswordResetRequestForm';
import { routes } from '../../../config/routes';


export function PasswordResetRequestPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ recipientEmail, setRecipientEmail ] = React.useState('');

    return (
        <Container component='main' maxWidth='xs'>
            <Typography component='h1' variant='h5' className={classes.header}>
                {t('passwordResetPage.resetPassword')}
            </Typography>
            {
                (recipientEmail)
                    ? (
                        <Typography variant='subtitle1' className={classes.subtitle}>
                            {t('passwordResetPage.sendResetInstructionsSuccess', { email: recipientEmail })}
                        </Typography>
                    )
                    : (
                        <>
                            <Typography variant='subtitle1' className={classes.subtitle}>
                                {t('passwordResetPage.sendResetInstructionsDescription')}
                            </Typography>

                            <PasswordResetRequestForm onSuccess={setRecipientEmail} />
                        </>
                    )
            }
            <Grid container direction='row-reverse'>
                <Grid item>
                    <MuiLink to={routes.login()} variant='body2' component={Link}>
                        {t('passwordResetPage.logInLink')}
                    </MuiLink>
                </Grid>
            </Grid>
        </Container>
    );
}

const useStyles = makeStyles((theme) => ({
    header: {
        marginBottom: theme.spacing(1),
    },
    subtitle: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
}));
