import React from 'react';
import { useNavigate } from 'react-router';
import { Reference } from '@apollo/client';
import { useSetRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';

import { projectDeleteConfirmationModalAtom } from '../../../modals/project-delete-confirmation/projectDeleteConfirmationModalAtom';
import { PageLinearProgressRevealer } from '../../../common/progress-indicators/PageLinearProgressRevealer';
import { useCurrentUserCachedData } from '../../../../utils/hooks/useCurrentUserCachedData';
import { Project, useDeleteProjectMutation } from '../../../../../graphql/generated-types';
import { ApolloErrorHandler } from '../../../../utils/error-handling/ApolloErrorHandler';
import { useToast } from '../../../providers/toast/useToast';
import { nav } from '../../../../config/nav';


export interface DeleteProjectButtonProps {
    projectSlug: string;
    projectName: string;
}

export function DeleteProjectButton({ projectSlug, projectName }: DeleteProjectButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { errorToast } = useToast();
    const userCachedData = useCurrentUserCachedData();
    const [ deleteProjectMutation, { loading } ] = useDeleteProjectMutation();

    const handleProjectDelete = React.useCallback(async () => {
        try {
            await deleteProjectMutation({
                variables: { projectSlug },
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteProject;

                    if (isSuccess) {
                        // navigate first in order to prevent refetch of ProjectDetails query
                        navigate(nav.createProject());
                        cache.modify({
                            id: cache.identify({ __typename: 'User', slug: userCachedData?.slug }),
                            fields: {
                                project: (existingProjectRef: Reference, { readField, DELETE }) => (
                                    (readField('slug', existingProjectRef) === projectSlug)
                                        ? DELETE
                                        : existingProjectRef
                                ),
                                projects: (existingProjectRefs: Reference[] = [], { readField }) => (
                                    existingProjectRefs.filter((projectRef) => readField('slug', projectRef) !== projectSlug)
                                ),
                            },
                        });
                        cache.evict({
                            id: cache.identify({ __typename: 'Project', slug: projectSlug }),
                        });
                    }
                },
            });
        } catch (error) {
            ApolloErrorHandler.process(error)
                .handleGraphQlError('RESOURCE_OWNER_ROLE_REQUIRED', () => {
                    errorToast(({ t }) => t('projectPage.resourceOwnerRoleRequiredError'));
                })
                .handleGraphQlError('PROJECT_NOT_FOUND', () => {
                    errorToast(({ t }) => t('projectPage.projectNotFoundError'));
                })
                .verifyIfAllErrorsAreHandled();
        }
    }, [ projectSlug, errorToast, deleteProjectMutation, navigate, userCachedData?.slug ]);

    const setModalState = useSetRecoilState(projectDeleteConfirmationModalAtom);
    const handleClick = () => {
        setModalState({
            open: true,
            onConfirm: handleProjectDelete,
            projectData: {
                name: projectName,
            },
        });
    };

    return (
        <Tooltip title={t('projectPage.deleteThisProject')!} arrow>
            <IconButton onClick={handleClick} aria-label={t('projectPage.deleteThisProject')}>
                <PageLinearProgressRevealer visible={loading} />
                <DeleteIcon />
            </IconButton>
        </Tooltip>
    );
}
