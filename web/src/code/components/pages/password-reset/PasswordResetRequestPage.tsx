import React from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { PasswordResetRequestForm } from './PasswordResetRequestForm';
import { nav } from '../../../config/nav';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';


export function PasswordResetRequestPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ recipientEmail, setRecipientEmail ] = React.useState('');

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <PageHeader>
                    <PageTitle>
                        {t('passwordResetPage.resetPassword')}
                    </PageTitle>
                </PageHeader>

                {
                    (recipientEmail)
                        ? (
                            <Typography variant='subtitle1' className={classes.subtitle}>
                                <Trans i18nKey='passwordResetPage.sendResetInstructionsSuccess'>
                                    {' '}<MuiLink component='span'>{{ email: recipientEmail }}</MuiLink>{' '}
                                </Trans>
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
                        <MuiLink to={nav.login()} variant='body2' component={Link}>
                            {t('passwordResetPage.logInLink')}
                        </MuiLink>
                    </Grid>
                </Grid>
            </Container>
        </PageEnterTransition>
    );
}

const useStyles = makeStyles((theme) => ({
    subtitle: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
}));
