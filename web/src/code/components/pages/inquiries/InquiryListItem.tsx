import React from 'react';
import { useTranslation } from 'react-i18next';

import { darken, lighten, makeStyles } from '@material-ui/core/styles';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';
import CategoryIcon from '@material-ui/icons/Category';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import Divider from '@material-ui/core/Divider';
import Chip from '@material-ui/core/Chip';

import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { OpenAddQuoteModalButton } from './actions/OpenAddQuoteModalButton';
import { InquiryDataFragment } from '../../../../graphql/generated-types';
import { OpenDeleteModalButton } from './actions/OpenDeleteModalButton';
import { OpenUpdateModalButton } from './actions/OpenUpdateModalButton';
import { categoryConfigMap } from '../../../config/supportedCategories';
import { ToggleBookmarkButton } from './actions/ToggleBookmarkButton';
import { HistoryButton } from '../../common/misc/HistoryButton';
import { LocationChip } from '../../common/misc/LocationChip';
import { ThemeType } from '../../../utils/theme/ThemeUtils';
import { ExpandIcon } from '../../common/icons/ExpandIcon';
import { UserChip } from '../../common/misc/UserChip';
import { QuoteList } from './QuoteList';


export interface InquiryListItemProps {
    inquiry: InquiryDataFragment;
    distance?: number;
    isOwned: boolean;
    isBookmarked: boolean;
    userSlug?: string;
}

const inquiryExpansionStateMemory = new WeakMap<InquiryDataFragment, boolean>();

export function InquiryListItem({ inquiry, distance, isOwned, isBookmarked, userSlug }: InquiryListItemProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ expanded, setExpanded ] = React.useState(Boolean(inquiryExpansionStateMemory.get(inquiry)));

    const handleToggle = () => {
        setExpanded(!expanded);
        inquiryExpansionStateMemory.set(inquiry, !expanded);
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
                id={`${inquiry.id}-header`}
                aria-controls={`${inquiry.id}-content`}
                classes={{
                    content: classes.MuiAccordionSummaryContent,
                }}
            >

                <Typography className={classes.inquiryTitle}>
                    {inquiry.title}
                </Typography>

                <ExpandIcon className={classes.expandIcon} expanded={expanded} />

                <div className={classes.inquiryChips}>
                    <Chip
                        label={t(categoryConfigMap[ inquiry.category ].tKey)}
                        icon={<CategoryIcon />}
                        size='small'
                        variant='outlined'
                        className={classes.inquiryChip}
                    />
                    <UserChip
                        user={inquiry.author}
                        size='small'
                        className={classes.inquiryChip}
                    />
                    <LocationChip
                        location={inquiry.location}
                        className={classes.inquiryChip}
                        size='small'
                        labelSuffix={distance ? ` (${distance.toFixed(2)} km)` : undefined}
                    />
                </div>

            </AccordionSummary>

            <AccordionDetails classes={{ root: classes.AccordionDetailsRoot }}>
                <Divider className={classes.dividerDescriptionTop} />
                <Typography variant='body2' gutterBottom color='textSecondary'>
                    {t('inquiry.descriptionSectionTitle')}
                </Typography>
                <RichTextPreviewer
                    value={inquiry.description}
                    className={classes.section}
                />

                <Divider className={classes.dividerQuoteListTop} />
                <Typography variant='body2' gutterBottom color='textSecondary'>
                    {t('inquiry.quotesSectionTitle')}
                </Typography>
                <QuoteList
                    quotes={inquiry.quotes}
                    inquiryId={inquiry.id}
                    userSlug={userSlug}
                    className={classes.section}
                />

                <Divider className={classes.dividerActionsTop} />
            </AccordionDetails>

            <AccordionActions>
                <HistoryButton
                    createdAt={inquiry.createdAt}
                    updatedAt={inquiry.updatedAt}
                    ariaLabel={t('inquiry.inquiryHistory')}
                    className={classes.historyButton}
                />
                {(isOwned) && (
                    <>
                        <OpenDeleteModalButton inquiry={inquiry} />
                        <OpenUpdateModalButton inquiry={inquiry} />
                    </>
                )}
                {(!isOwned && userSlug) && (
                    <>
                        <ToggleBookmarkButton
                            inquiryId={inquiry.id}
                            isBookmarked={isBookmarked}
                            userSlug={userSlug}
                        />
                        <OpenAddQuoteModalButton inquiry={inquiry} />
                    </>
                )}
            </AccordionActions>
        </Accordion>
    );
}

const useStyles = makeStyles((theme) => ({
    MuiAccordionRoot: {
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create([ 'margin', 'border-color' ], {
            duration: theme.transitions.duration.shortest,
        }),
        margin: theme.spacing(1, 0),
        boxShadow: 'unset',
        '&:hover': {
            border: `1px solid ${(theme.palette.type === ThemeType.light)
                ? lighten(theme.palette.text.disabled, 0.5)
                : darken(theme.palette.text.disabled, 0.4)
            }`,
        },
        '&$MuiAccordionExpanded': {
            borderColor: (theme.palette.type === ThemeType.light)
                ? lighten(theme.palette.text.disabled, 0.2)
                : darken(theme.palette.text.disabled, 0.2),
            borderRadius: theme.shape.borderRadius,
            '& $inquiryTitle': {
                fontSize: '1.2rem',
                marginBottom: theme.spacing(1.5),
                [ theme.breakpoints.up('sm') ]: {
                    marginLeft: theme.spacing(1),
                },
            },
            '& $section': {
                [ theme.breakpoints.up('sm') ]: {
                    margin: theme.spacing(0, 1),
                },
            },
        },
        '&:before': {
            display: 'none',
        },
    },
    MuiAccordionExpanded: {},
    MuiAccordionSummaryContent: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gridTemplateAreas: `
            'title title icon'
            'chips chips chips'
        `,
    },
    inquiryTitle: {
        gridArea: 'title',
        marginBottom: theme.spacing(0.5),
        transition: theme.transitions.create([ 'font-size', 'margin' ], {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandIcon: {
        gridArea: 'icon',
        marginLeft: theme.spacing(2),
    },
    inquiryChips: {
        gridArea: 'chips',
    },
    inquiryChip: {
        marginTop: 3,
        marginRight: 3,
    },
    AccordionDetailsRoot: {
        padding: theme.spacing(0, 2),
        flexDirection: 'column',
    },
    historyButton: {
        marginRight: 'auto',
    },
    section: {
        transition: theme.transitions.create([ 'margin' ], {
            duration: theme.transitions.duration.shortest,
        }),
    },
    dividerDescriptionTop: {
        margin: theme.spacing(0, -1, 1, -1),
    },
    dividerQuoteListTop: {
        margin: theme.spacing(2, -1, 1, -1),
    },
    dividerActionsTop: {
        margin: theme.spacing(2, -1, 0, -1),
    },
}));
