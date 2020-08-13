import React from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import MuiLink from '@material-ui/core/Link';

import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { ChangeProfileSettingsForm } from './ChangeProfileSettingsForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { Section } from '../../common/section/Section';
import { ChangeEmailForm } from './ChangeEmailForm';
import { nav } from '../../../config/nav';


export function SettingsPage(): React.ReactElement {
    const { t } = useTranslation();
    const userCachedData = useCurrentUserCachedData();

    return (
        <PageEnterTransition>
            <Container maxWidth='sm'>

                <PageHeader>
                    <PageTitle>
                        {t('common.settings')}
                    </PageTitle>
                </PageHeader>

                <Section defaultExpanded title={t('user.settings.changeEmail')} id='change-email'>
                    <ChangeEmailForm />
                </Section>

                <Section defaultExpanded title={t('user.settings.changePassword')} id='change-password'>
                    <ChangePasswordForm />
                </Section>

                <Section defaultExpanded title={t('user.settings.changeProfileSettings')} id='change-profile-settings'>
                    <Typography>
                        <Trans i18nKey='user.settings.profileModeDescription'>
                            {' '}<MuiLink to={nav.user(userCachedData?.slug!).profile()}
                            component={Link}>{' '}</MuiLink>{' '}
                        </Trans>
                    </Typography>
                    <ChangeProfileSettingsForm />
                </Section>

            </Container>
        </PageEnterTransition>
    );
}
