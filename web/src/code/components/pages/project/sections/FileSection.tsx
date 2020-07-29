import React from 'react';
import clsx from 'clsx';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil/dist';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ButtonBase from '@material-ui/core/ButtonBase';
import ClearIcon from '@material-ui/icons/Clear';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import { ProjectDetailedDataFragment, ResourceData, useDeleteProjectFileMutation } from '../../../../../graphql/generated-types';
import { projectFileUploadModalAtom } from '../../../modals/project-file-upload/projectFileUploadModalAtom';
import { ApolloErrorHandler } from '../../../../utils/error-handling/ApolloErrorHandler';
import { ConsciousFileIcon } from '../../../common/icons/ConsciousFileIcon';
import { UploadFileIcon } from '../../../common/icons/UploadFileIcon';
import { useToast } from '../../../providers/toast/useToast';
import { Section } from './Section';


export interface FileSectionProps {
    project: Pick<ProjectDetailedDataFragment, 'slug' | 'name' | 'files'>;
}

export function FileSection({ project }: FileSectionProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Section id='files' title={t('projectPage.files')} className={classes.fileList}>

            <UploadFileButton
                t={t}
                projectSlug={project.slug}
                projectName={project.name}
                classes={{
                    tile: clsx(classes.tile, classes.uploadFileTile),
                    previewIcon: classes.previewIcon,
                    textContainer: clsx(classes.textContainer, classes.uploadFileButtonLabel),
                }}
            />

            {
                project.files.map((file, index) => (
                    <FileTile
                        key={index}
                        t={t}
                        index={index}
                        projectSlug={project.slug}
                        fileData={file}
                        classes={{
                            tile: classes.tile,
                            link: classes.link,
                            previewIcon: classes.previewIcon,
                            deleteButton: classes.deleteButton,
                            textContainer: classes.textContainer,
                        }}
                    />
                ))
            }
        </Section>
    );
}

interface FileTileProps {
    t: TFunction;
    index: number;
    projectSlug: string;
    fileData: ResourceData;
    classes: {
        tile: string;
        link: string;
        previewIcon: string;
        deleteButton: string;
        textContainer: string;
    },
}

function FileTile({ t, index, projectSlug, fileData, classes }: FileTileProps): React.ReactElement {
    const { errorToast } = useToast();
    const [ deleteProjectFileMutation ] = useDeleteProjectFileMutation();

    const handleFileDelete = React.useCallback(async (event: React.SyntheticEvent<HTMLElement>) => {
        event.stopPropagation();
        event.preventDefault();
        try {
            await deleteProjectFileMutation({
                variables: { projectSlug, resourceName: fileData.name },
                update: (cache, { data }) => {
                    const isSuccess = data?.deleteProjectFile;
                    isSuccess && cache.modify({
                        id: cache.identify({ __typename: 'Project', slug: projectSlug }),
                        fields: {
                            files: (existingFiles: ResourceData[] = []) => (
                                existingFiles.filter(({ name }) => name !== fileData.name)
                            ),
                        },
                    });
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
    }, [ projectSlug, fileData.name, errorToast, deleteProjectFileMutation ]);

    const descriptionId = `file-tile-${index}-description`;

    return (
        <Paper variant='outlined' className={classes.tile}>
            <Link
                className={classes.link}
                underline='none'
                color='inherit'
                href={fileData.url}
                rel='noreferrer'
                target='_blank'
                aria-label={t('projectPage.openFile', { filename: fileData.name })}
                aria-describedby={descriptionId}
            >

                <ConsciousFileIcon className={classes.previewIcon} filename={fileData.name} />

                <Tooltip title={t('projectPage.removeThisFile')!} arrow>
                    <IconButton
                        size='small'
                        className={classes.deleteButton}
                        onClick={handleFileDelete}
                        aria-label={t('projectPage.removeThisFile')}
                    >
                        <ClearIcon />
                    </IconButton>
                </Tooltip>

                <Divider />

                <div className={classes.textContainer}>

                    <Typography variant='body2' component='span' display='block'>
                        {fileData.name}
                    </Typography>

                    <Typography id={descriptionId} variant='caption' component='span' color='textSecondary'
                        display='block'>
                        {fileData.description}
                    </Typography>

                </div>

            </Link>
        </Paper>
    );
}

interface UploadFileButtonProps {
    t: TFunction;
    projectSlug: string;
    projectName: string;
    classes: {
        tile: string;
        previewIcon: string;
        textContainer: string;
    },
}

const OutlinedPaper = React.forwardRef<any, any>((props, ref) => (
    <Paper {...props} ref={ref} variant='outlined' />
));

function UploadFileButton({ t, projectSlug, projectName, classes }: UploadFileButtonProps): React.ReactElement {
    const setModalState = useSetRecoilState(projectFileUploadModalAtom);
    const handleClick = React.useCallback(() => {
        setModalState({
            open: true,
            projectData: {
                slug: projectSlug,
                name: projectName,
            },
        });
    }, [ setModalState ]);

    return (
        <ButtonBase
            className={classes.tile}
            onClick={handleClick}
            component={OutlinedPaper}
        >

            <UploadFileIcon className={classes.previewIcon} />

            <Divider />

            <div className={classes.textContainer}>
                <Typography variant='body2' component='span'>
                    {t('projectPage.uploadFile')}
                </Typography>
            </div>

        </ButtonBase>
    );
}

const useStyles = makeStyles((theme) => ({
    fileList: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gridGap: theme.spacing(2),
        gap: theme.spacing(2),
        [ theme.breakpoints.up('sm') ]: {
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        },
    },
    tile: {
        transition: theme.transitions.create([ 'border' ], {
            duration: theme.transitions.duration.short,
        }),
        '&:hover': {
            border: `1px solid ${theme.palette.text.secondary}`,
        },
        '&:focus-within': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
        '&:hover, &:focus-within': {
            '& $deleteButton': {
                opacity: 1,
            },
            '& $previewIcon': {
                color: theme.palette.text.primary,
            },
        },
    },
    uploadFileTile: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
    },
    link: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        outline: 'none',
        height: '100%',
    },
    deleteButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        padding: theme.spacing(1),
        border: '1px solid transparent',
        transition: theme.transitions.create([ 'opacity', 'border' ], {
            duration: theme.transitions.duration.standard,
        }),
        '&:hover': {
            border: `1px solid ${theme.palette.text.secondary}`,
        },
        '&:focus': {
            border: `1px solid ${theme.palette.primary.main}`,
        },
        [ theme.breakpoints.up('sm') ]: {
            opacity: 0.1,
            right: theme.spacing(1.5),
            top: theme.spacing(1.5),
        },
    },
    squareImageContainer: {
        position: 'relative',
        paddingTop: '100%',
    },
    previewIcon: {
        display: 'block',
        width: '100%',
        height: 'initial',
        padding: theme.spacing(4, 4, 2, 2),
        color: theme.palette.text.secondary,
        transition: theme.transitions.create([ 'color' ], {
            duration: theme.transitions.duration.standard,
        }),
        [ theme.breakpoints.up('sm') ]: {
            padding: theme.spacing(4),
        },
    },
    textContainer: {
        flexGrow: 1,
        padding: theme.spacing(1.5, 1.5, 2, 1.5),
        [ theme.breakpoints.up('sm') ]: {
            padding: theme.spacing(2, 2, 3, 2),
        },
    },
    uploadFileButtonLabel: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },
}));
