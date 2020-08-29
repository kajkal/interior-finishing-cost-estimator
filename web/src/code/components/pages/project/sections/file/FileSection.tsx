import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import { ResourceData, useDeleteProjectFileMutation } from '../../../../../../graphql/generated-types';
import { usePageLinearProgressRevealer } from '../../../../common/progress-indicators/usePageLinearProgressRevealer';
import { projectFileUploadModalAtom } from '../../../../modals/project-file-upload/projectFileUploadModalAtom';
import { ApolloErrorHandler } from '../../../../../utils/error-handling/ApolloErrorHandler';
import { CompleteProjectData } from '../../../../../utils/mappers/projectMapper';
import { ConsciousFileIcon } from '../../../../common/icons/ConsciousFileIcon';
import { HistoryButton } from '../../../../common/misc/HistoryButton';
import { PaperButton } from '../../../../common/misc/PaperButton';
import { Section } from '../../../../common/section/Section';


export interface FileSectionProps {
    project: Pick<CompleteProjectData, 'slug' | 'name' | 'files'>;
}

export function FileSection({ project }: FileSectionProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const setFileUploadModalState = useSetRecoilState(projectFileUploadModalAtom);
    const [ deleteProjectFileMutation, { loading } ] = useDeleteProjectFileMutation();
    usePageLinearProgressRevealer(loading);

    const handleFileDelete = React.useCallback((file: ResourceData) => (
        async (event: React.SyntheticEvent<HTMLElement>) => {
            event.stopPropagation();
            event.preventDefault();
            try {
                await deleteProjectFileMutation({
                    variables: { projectSlug: project.slug, resourceName: file.name },
                    update: (cache, { data }) => {
                        const isSuccess = data?.deleteProjectFile;
                        isSuccess && cache.modify({
                            id: cache.identify({ __typename: 'Project', slug: project.slug }),
                            fields: {
                                files: (existingFiles: ResourceData[] = []) => (
                                    existingFiles.filter(({ name }) => name !== file.name)
                                ),
                            },
                        });
                    },
                });
            } catch (error) {
                ApolloErrorHandler.process(error).verifyIfAllErrorsAreHandled();
            }
        }
    ), [ project.slug, deleteProjectFileMutation ]);

    const handleAddFile = () => {
        setFileUploadModalState({
            open: true,
            projectData: {
                slug: project.slug,
                name: project.name,
            },
        });
    };

    return (
        <Section id='files' title={t('project.files')} className={classes.fileList} defaultExpanded>
            {project.files.map((file) => (
                <Paper key={file.name} variant='outlined' data-testid='file'>

                    <div className={classes.fileHeader}>
                        <ConsciousFileIcon
                            filename={file.name}
                            className={classes.fileTypeIcon}
                            aria-hidden
                        />
                        <div>
                            <Typography className={classes.fileName}>
                                {file.name}
                            </Typography>
                            <Typography variant='body2' color='textSecondary'>
                                {file.description}
                            </Typography>
                        </div>
                    </div>

                    <Divider className={classes.dividerActionsTop} />

                    <div className={classes.roomActions}>
                        <HistoryButton
                            createdAt={file.createdAt}
                            ariaLabel={t('project.fileHistory')}
                        />
                        <Button
                            variant='outlined'
                            size='small'
                            aria-label={t('project.removeFile', { filename: file.name })}
                            onClick={handleFileDelete(file)}
                            startIcon={<DeleteIcon />}
                        >
                            {t('form.common.delete')}
                        </Button>
                        <Button
                            variant='outlined'
                            size='small'
                            startIcon={<OpenInNewIcon />}
                            aria-label={t('project.openFile', { filename: file.name })}
                            href={file.url}
                            rel='noreferrer'
                            target='_blank'
                        >
                            {t('form.common.open')}
                        </Button>
                    </div>

                </Paper>
            ))}
            <PaperButton onClick={handleAddFile} contentClassName={classes.uploadFileButton}>
                <Typography>
                    {t('project.uploadFile')}
                </Typography>
            </PaperButton>
        </Section>
    );
}

const useStyles = makeStyles((theme) => ({
    dividerActionsTop: {
        margin: theme.spacing(0, 1),
    },
    fileList: {
        '& > *': {
            margin: theme.spacing(0.5, 0),
        },
    },
    fileHeader: {
        padding: theme.spacing(2.5, 1.5),
        display: 'flex',
        alignItems: 'center',
    },
    fileTypeIcon: {
        fontSize: '2rem',
        marginRight: theme.spacing(1.5),
        alignSelf: 'flex-start',
    },
    fileName: {
        fontSize: '1.2rem',
    },
    uploadFileButton: {
        padding: theme.spacing(1, 3),
    },
    roomActions: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'flex-end',
        '& > :not(:first-child)': {
            marginLeft: theme.spacing(1),
        }
    },
}));
