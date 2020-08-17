import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HistoryIcon from '@material-ui/icons/History';
import Tooltip from '@material-ui/core/Tooltip';


export interface HistoryButtonProps {
    createdAt: string;
    updatedAt?: string;
    ariaLabel?: string;
    className?: string;
}

export function HistoryButton({ createdAt, updatedAt, ariaLabel, className }: HistoryButtonProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const [ open, setOpen ] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleToggle = () => {
        setOpen((prev) => !prev);
    };

    const historyTooltip = (
        <div className={classes.datesContainer}>
            <Typography variant='caption'>
                {t('common.created')}
            </Typography>
            <Typography variant='caption'>
                {DateTime.fromISO(createdAt).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_MED)}
            </Typography>
            {updatedAt && (
                <>
                    <Typography variant='caption'>
                        {t('common.updated')}
                    </Typography>
                    <Typography variant='caption'>
                        {DateTime.fromISO(updatedAt).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_MED)}
                    </Typography>
                </>
            )}
        </div>
    );

    return (
        <Tooltip title={historyTooltip} open={open} onClose={handleClose} onOpen={handleOpen} interactive>
            <IconButton size='small' className={className} aria-label={ariaLabel} onClick={handleToggle}>
                <HistoryIcon />
            </IconButton>
        </Tooltip>
    );
}

const useStyles = makeStyles((theme) => ({
    datesContainer: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridColumnGap: theme.spacing(1),
        columnGap: theme.spacing(1),
    },
}));
