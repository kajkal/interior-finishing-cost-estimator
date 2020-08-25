import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { InquiryDataFragment } from '../../../../graphql/generated-types';
import { categoryConfigMap } from '../../../config/supportedCategories';
import { TagChip } from './TagChip';


export interface InquiryPreviewProps {
    inquiry: InquiryDataFragment;
    className?: string;
}

export function InquiryPreview({ inquiry, className }: InquiryPreviewProps): React.ReactElement {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Paper variant='outlined' className={clsx(classes.inquiryContainer, className)}>
            <Typography>
                {inquiry.title}
            </Typography>
            <div>
                <TagChip label={t(categoryConfigMap[ inquiry.category ].tKey)} />
            </div>
        </Paper>
    );
}

const useStyles = makeStyles((theme) => ({
    inquiryContainer: {
        padding: theme.spacing(1),
    },
}));
