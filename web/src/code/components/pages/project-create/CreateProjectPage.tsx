import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import { CreateProjectForm } from './CreateProjectForm';


export function CreateProjectPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Container maxWidth='xs'>

            <Typography component='h1' variant='h5'>
                {t('common.createProject')}
            </Typography>

            <CreateProjectForm formClassName={classes.form} />

        </Container>
    );
}


const useStyles = makeStyles((theme) => ({
    form: {
        marginTop: theme.spacing(1),
    },
}));
