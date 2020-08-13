import React from 'react';

import Container from '@material-ui/core/Container';

import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';


export function InquiriesPage(): React.ReactElement {
    return (
        <PageEnterTransition>
            <Container maxWidth='lg'>

                <PageHeader>
                    <PageTitle>
                        {'TODO Inquiries page'}
                    </PageTitle>
                </PageHeader>

            </Container>
        </PageEnterTransition>
    );
}
