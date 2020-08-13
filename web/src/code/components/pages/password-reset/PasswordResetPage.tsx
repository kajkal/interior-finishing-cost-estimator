import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';

import MuiLink from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { useVerifiedToken } from '../../../utils/hooks/useVerifiedToken';
import { useSearchParams } from '../../../utils/hooks/useSearchParams';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { useToast } from '../../providers/toast/useToast';
import { PasswordResetForm } from './PasswordResetForm';
import { nav } from '../../../config/nav';


export function PasswordResetPage(): React.ReactElement {
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
        return <Navigate to={nav.forgotPassword()} />;
    }

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <PageHeader>
                    <PageTitle>
                        {t('passwordResetPage.resetPassword')}
                    </PageTitle>
                </PageHeader>

                <PasswordResetForm passwordResetToken={verifiedPasswordResetToken} />

                <Grid container direction='row-reverse'>
                    <Grid item>
                        <MuiLink to={nav.signup()} variant='body2' component={Link}>
                            {t('passwordResetPage.signUpLink')}
                        </MuiLink>
                    </Grid>
                </Grid>

            </Container>
        </PageEnterTransition>
    );
}
