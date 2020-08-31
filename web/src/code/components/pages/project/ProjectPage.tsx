import React from 'react';
import { useParams } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { mapProjectDataToCompleteProjectData } from '../../../utils/mappers/projectMapper';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { ApolloErrorHandler } from '../../../utils/error-handling/ApolloErrorHandler';
import { useProjectDetailsQuery } from '../../../../graphql/generated-types';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { DeleteProjectButton } from './elements/DeleteProjectButton';
import { UpdateProjectButton } from './elements/UpdateProjectButton';
import { SummarySection } from './sections/summary/SummarySection';
import { LocationChip } from '../../common/misc/LocationChip';
import { PageActions } from '../../common/page/PageActions';
import { FileSection } from './sections/file/FileSection';
import { RoomSection } from './sections/room/RoomSection';
import { PageHeader } from '../../common/page/PageHeader';
import { PageNotFound } from '../not-found/PageNotFound';
import { PageTitle } from '../../common/page/PageTitle';


export function ProjectPage(): React.ReactElement {
    const classes = useStyles();
    const { projectSlug } = useParams();
    const userCachedData = useCurrentUserCachedData();
    const { data, error, loading } = useProjectDetailsQuery({ variables: { slug: projectSlug } });
    usePageLinearProgressRevealer(loading);
    const projectData = data?.me.project;
    const completeProjectData = React.useMemo(() => (
        (projectData && userCachedData)
            ? mapProjectDataToCompleteProjectData(projectData, userCachedData)
            : null
    ), [ projectData, userCachedData ]);

    React.useEffect(() => {
        error && ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
    }, [ error, projectData ]);

    if (error || (projectData === null)) {
        return <PageNotFound />;
    }

    return (
        <PageEnterTransition in={Boolean(completeProjectData)} key={projectSlug}>
            <Container maxWidth='lg'>

                <PageHeader>
                    <PageTitle>
                        {completeProjectData?.name}
                    </PageTitle>
                    {(completeProjectData) && (
                        <PageActions>
                            <DeleteProjectButton project={completeProjectData} />
                            <UpdateProjectButton project={completeProjectData} />
                        </PageActions>
                    )}
                </PageHeader>

                {(completeProjectData) && (
                    <>
                        <div className={classes.tagsContainer}>
                            {completeProjectData.location && (
                                <LocationChip location={completeProjectData.location} className={classes.noWrap} />
                            )}
                        </div>

                        <div className={classes.project}>
                            <FileSection project={completeProjectData} defaultExpanded />
                            <RoomSection project={completeProjectData} defaultExpanded />
                            <SummarySection project={completeProjectData} defaultExpanded />
                        </div>
                    </>
                )}

            </Container>
        </PageEnterTransition>
    );
}

const useStyles = makeStyles((theme) => ({
    project: {
        marginTop: theme.spacing(3),
        [ theme.breakpoints.up('sm') ]: {
            marginTop: theme.spacing(6),
        },
    },
    tagsContainer: {
        display: 'grid',
        justifyContent: 'start',
    },
    noWrap: {
        overflow: 'hidden',
    },
}));
