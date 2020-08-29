import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';

import { ExpandIcon } from '../icons/ExpandIcon';


export interface SectionProps {
    children: React.ReactNode;
    title: React.ReactNode;
    id: string;
    className?: string;
    defaultExpanded?: boolean;
}

const sectionExpansionStateMemory = new Map<string, boolean>();

export function Section({ children, title, id, className, defaultExpanded = sectionExpansionStateMemory.get(id) }: SectionProps): React.ReactElement {
    const classes = useStyles();
    const [ expanded, setExpanded ] = React.useState(Boolean(defaultExpanded));

    const handleToggle = () => {
        setExpanded(!expanded);
        sectionExpansionStateMemory.set(id, !expanded);
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={handleToggle}
            classes={{
                root: classes.MuiAccordionRoot,
                expanded: classes.MuiAccordionExpanded,
            }}
        >

            <AccordionSummary
                id={`${id}-header`}
                aria-controls={`${id}-content`}
                classes={{
                    root: classes.MuiAccordionSummaryRoot,
                    content: classes.MuiAccordionSummaryContent,
                    expanded: classes.MuiAccordionSummaryExpanded,
                }}
            >

                <ExpandIcon expanded={expanded} className={classes.projectSectionExpandIcon} />

                <Typography variant='h5'>
                    {title}
                </Typography>

            </AccordionSummary>

            <AccordionDetails
                className={className}
                classes={{
                    root: classes.MuiAccordionDetailsRoot,
                }}
            >
                {children}
            </AccordionDetails>

        </Accordion>
    );
}

const useStyles = makeStyles((theme) => ({
    MuiAccordionRoot: {
        backgroundColor: 'unset',
        boxShadow: 'unset',
        '&:before': {
            display: 'none',
        },
        '&$MuiAccordionExpanded': {
            margin: 0,
        },
    },
    MuiAccordionExpanded: {},
    MuiAccordionSummaryRoot: {
        padding: 0,
        '&$MuiAccordionSummaryExpanded': {
            minHeight: 'unset',
        },
        '&:hover': {
            textDecoration: 'underline',
        },
    },
    MuiAccordionSummaryContent: {
        alignItems: 'center',
        '&$MuiAccordionSummaryExpanded': {
            margin: theme.spacing(1.5, 0),
        },
    },
    MuiAccordionSummaryExpanded: {},
    MuiAccordionDetailsRoot: {
        flexDirection: 'column',
        padding: theme.spacing(1, 0, 5, 1),
        [ theme.breakpoints.up('sm') ]: {
            padding: theme.spacing(1, 0, 5, 4.75),
        },
    },
    projectSectionExpandIcon: {
        marginRight: theme.spacing(1.5),
    },
}));
