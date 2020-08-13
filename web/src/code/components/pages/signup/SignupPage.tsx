import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Container from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';

import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { SignupForm } from './SignupForm';
import { nav } from '../../../config/nav';


export function SignupPage(): React.ReactElement {
    const { t } = useTranslation();
    const isUserLoggedIn = Boolean(useCurrentUserCachedData());

    if (isUserLoggedIn) {
        return <Navigate to={nav.profile()} />;
    }

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <PageHeader>
                    <PageTitle>
                        {t('signupPage.signUp')}
                    </PageTitle>
                </PageHeader>

                <SignupForm />

                <Grid container direction='row-reverse'>
                    <Grid item>
                        <MuiLink to={nav.login()} variant='body2' component={Link}>
                            {t('signupPage.logInLink')}
                        </MuiLink>
                    </Grid>
                </Grid>

            </Container>
        </PageEnterTransition>
    );
}
