import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import MuiLink from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { useVerifiedToken } from '../../../utils/hooks/useVerifiedToken';
import { useSearchParams } from '../../../utils/hooks/useSearchParams';
import { useToast } from '../../providers/toast/useToast';
import { PasswordResetForm } from './PasswordResetForm';
import { routes } from '../../../config/routes';


export function PasswordResetPage(): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const { errorToast } = useToast();
    const { token } = useSearchParams('token');
    const [ verifiedPasswordResetToken, expiredAt ] = useVerifiedToken(token, 'checkExpiration');

    React.useEffect(() => {
        if (expiredAt) {
            const formattedExpirationDate = DateTime.fromJSDate(expiredAt).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_SHORT);
            errorToast(({ t }) => t('passwordResetPage.expiredPasswordResetToken', { date: formattedExpirationDate }));
        } else if (!verifiedPasswordResetToken) {
            errorToast(({ t }) => t('passwordResetPage.invalidPasswordResetToken'));
        }
    }, [ expiredAt, verifiedPasswordResetToken, i18n.language, errorToast ]);

    if (!verifiedPasswordResetToken) {
        return <Redirect to={routes.forgotPassword()} />;
    }

    return (
        <Container maxWidth='xs' disableGutters>
            <Typography component='h1' variant='h5' className={classes.header}>
                {t('passwordResetPage.resetPassword')}
            </Typography>

            <PasswordResetForm passwordResetToken={verifiedPasswordResetToken} />

            <Grid container direction='row-reverse'>
                <Grid item>
                    <MuiLink to={routes.signup()} variant='body2' component={Link}>
                        {t('passwordResetPage.signUpLink')}
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
}));
