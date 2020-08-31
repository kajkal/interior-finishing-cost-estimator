import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { summarizeAll, summarizeRoom, summarizeRooms } from '../../../../../utils/mappers/roomMapper';
import { CompleteProjectData } from '../../../../../utils/mappers/projectMapper';
import { Section } from '../../../../common/section/Section';
import { SummaryRow } from './SummaryRow';
import { Chart } from './Chart';


export interface SummarySectionProps {
    project: Pick<CompleteProjectData, 'rooms'>;
    defaultExpanded?: boolean;
}

export const SummarySection = React.memo(
    function SummarySection({ project, defaultExpanded }: SummarySectionProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();
        const roomSummaries = project.rooms.map((room) => ({ room, summary: summarizeRoom(room) }));
        const roomsSummary = summarizeRooms(roomSummaries.map(({ summary }) => summary));
        const totalSummary = summarizeAll(roomsSummary);

        return (
            <Section
                id='rooms'
                title={t('project.summary')}
                className={classes.summaryList}
                defaultExpanded={defaultExpanded}
            >
                <Paper variant='outlined' className={classes.summaryTable}>
                    {(roomSummaries.length)
                        ? (
                            <>
                                {roomSummaries.map(({ room, summary }) => (
                                    <SummaryRow
                                        key={room.id}
                                        room={room}
                                        summary={summary}
                                        data-testid={`room-summary-${room.id}`}
                                    />
                                ))}
                                <SummaryRow
                                    summary={roomsSummary}
                                    className={classes.totalSummaryRow}
                                    data-testid='total-summary'
                                />
                            </>
                        )
                        : (
                            <Typography variant='body2'>
                                {t('project.noData')}
                            </Typography>
                        )}
                </Paper>
                <div className={classes.chartContainer}>
                    {totalSummary.map((totalAmount) => (
                        <Chart
                            key={totalAmount.currency}
                            rooms={project.rooms}
                            totalAmount={totalAmount}
                            data-testid={`sunburst-chart-${totalAmount.currency}`}
                        />
                    ))}
                </div>
            </Section>
        );
    },
);

const useStyles = makeStyles((theme) => ({
    chartContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridGap: theme.spacing(1),
        gap: theme.spacing(1),
        [ theme.breakpoints.up('md') ]: {
            gridTemplateColumns: '1fr 1fr',
        },
    },
    summaryList: {
        '& > *': {
            margin: theme.spacing(0.5, 0),
        },
    },
    summaryTable: {
        padding: theme.spacing(2.5, 1.5),
        '& > *:not(:first-child)': {
            marginTop: theme.spacing(1),
            paddingTop: theme.spacing(1),
            borderTop: `1px solid ${theme.palette.divider}`,
        },
    },
    totalSummaryRow: {
        borderColor: [ theme.palette.text.disabled, '!important' ] as unknown as string,
    },
}));
