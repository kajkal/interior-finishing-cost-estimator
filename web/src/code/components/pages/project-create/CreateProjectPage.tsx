import React from 'react';
import { useTranslation } from 'react-i18next';

import Container from '@material-ui/core/Container';

import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { CreateProjectForm } from './CreateProjectForm';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';


export function CreateProjectPage(): React.ReactElement {
    const { t } = useTranslation();

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <PageHeader>
                    <PageTitle>
                        {t('common.createProject')}
                    </PageTitle>
                </PageHeader>

                <CreateProjectForm />

            </Container>
        </PageEnterTransition>
    );
}
