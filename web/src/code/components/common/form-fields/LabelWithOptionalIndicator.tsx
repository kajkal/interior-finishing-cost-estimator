import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';


export interface LabelWithOptionalIndicatorProps {
    label: React.ReactNode;
}

export function LabelWithOptionalIndicator({ label }: LabelWithOptionalIndicatorProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    return (
        <>
            {label}
            <Typography
                className={classes.root}
                component='span'
                variant='body2'
                color='textSecondary'
            >
                {`(${t('form.common.optional')})`}
            </Typography>
        </>
    );
}

const useStyles = makeStyles({
    root: {
        marginLeft: '0.5em',
    },
});
