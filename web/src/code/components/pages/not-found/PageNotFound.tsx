import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { PageEnterTransition } from '../../common/page/PageEnterTransition';


export function PageNotFound(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <PageEnterTransition>
            <Container maxWidth='xs'>

                <Typography component='h1' variant='h1' className={classes.centered}>
                    {'404'}
                </Typography>

                <Typography component='h3' variant='h4' className={classes.centered}>
                    {t('notFoundPage.pageNotFound')}
                </Typography>

            </Container>
        </PageEnterTransition>
    );
}


const useStyles = makeStyles({
    centered: {
        textAlign: 'center',
    },
});
