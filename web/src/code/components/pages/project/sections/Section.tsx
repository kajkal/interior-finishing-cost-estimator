import React from 'react';
import clsx from 'clsx';

import { makeStyles, Theme } from '@material-ui/core/styles';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';

import { ExpandIcon } from '../../../common/icons/ExpandIcon';


export interface SectionProps {
    children: React.ReactNode;
    title: React.ReactNode;
    id: string;
    className?: string;
}

export function Section({ children, title, id, className }: SectionProps): React.ReactElement {
    const classes = useStyles();
    const [ expanded, setExpanded ] = React.useState(false);
    const handleAccordionToggle = () => setExpanded((expanded) => !expanded);

    return (
        <Accordion expanded={expanded} onChange={handleAccordionToggle}>

            <AccordionSummary id={`${id}-header`} aria-controls={`${id}-content`}>

                <ExpandIcon expanded={expanded} className={classes.projectSectionExpandIcon} />

                <Typography variant='h5'>
                    {title}
                </Typography>

            </AccordionSummary>

            <AccordionDetails className={clsx({ [ className! ]: className })}>
                {children}
            </AccordionDetails>

        </Accordion>
    );
}

const useStyles = makeStyles((theme: Theme) => ({
    projectSectionExpandIcon: {
        marginRight: theme.spacing(1.5),
    },
}));
