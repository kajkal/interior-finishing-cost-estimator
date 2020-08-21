import React from 'react';
import { useParams } from 'react-router';

import Container from '@material-ui/core/Container';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { useProfileQuery } from '../../../../graphql/generated-types';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { PageNotFound } from '../not-found/PageNotFound';
import { UserProfile } from './UserProfile';


export function UserProfilePage(): React.ReactElement {
    const { userSlug } = useParams();
    const { data, error, loading } = useProfileQuery({ variables: { userSlug } });
    usePageLinearProgressRevealer(loading);

    React.useEffect(() => {
        error && ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
    }, [ error ]);

    if (error) {
        return <PageNotFound />;
    }

    return (
        <PageEnterTransition in={Boolean(data?.profile)}>
            <Container maxWidth='md'>

                <PageHeader>
                    <PageTitle>
                        {data?.profile.name}
                    </PageTitle>
                </PageHeader>

                {(data?.profile) && (
                    <UserProfile profile={data.profile} />
                )}

            </Container>
        </PageEnterTransition>
    );
}
