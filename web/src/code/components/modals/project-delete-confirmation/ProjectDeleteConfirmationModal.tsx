import React from 'react';
import { useRecoilState } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import { projectDeleteConfirmationModalAtom } from './projectDeleteConfirmationModalAtom';
import { Typography } from '@material-ui/core';


export function ProjectDeleteConfirmationModal(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ { open, onConfirm, projectData }, setModalState ] = useRecoilState(projectDeleteConfirmationModalAtom);

    const handleModalClose = React.useCallback(() => {
        setModalState((prevState) => ({ ...prevState, open: false, onConfirm: undefined }));
    }, [ setModalState ]);
    const handleModalConfirm = () => {
        handleModalClose();
        onConfirm && onConfirm();
    };

    const titleId = 'delete-project-dialog-title';
    const contentId = 'delete-project-dialog-content';

    return (
        <Dialog open={open} onClose={handleModalClose} aria-labelledby={titleId} aria-describedby={contentId}>

            <DialogTitle id={titleId}>
                {t('modal.projectDeleteConfirmation.title', { projectName: projectData?.name })}
            </DialogTitle>

            <DialogContent id={contentId}>
                <Typography color='textSecondary'>
                    {t('modal.projectDeleteConfirmation.firstLine')}
                </Typography>
                <Typography color='textSecondary' className={classes.contentBottom}>
                    {t('modal.projectDeleteConfirmation.secondLine')}
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button type='button' variant='outlined' onClick={handleModalClose}>
                    {t('modal.common.cancel')}
                </Button>
                <Button type='button' variant='contained' onClick={handleModalConfirm} className={classes.deleteButton}>
                    {t('modal.projectDeleteConfirmation.delete')}
                </Button>
            </DialogActions>

        </Dialog>
    );
}


const useStyles = makeStyles((theme) => ({
    contentBottom: {
        marginBottom: theme.spacing(1.5),
    },
    deleteButton: {
        color: theme.palette.error.contrastText,
        backgroundColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: theme.palette.error.main,
            },
        },
    },
}));
