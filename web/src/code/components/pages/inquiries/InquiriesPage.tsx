import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil/dist';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

import { usePageLinearProgressRevealer } from '../../common/progress-indicators/usePageLinearProgressRevealer';
import { inquiryCreateModalAtom } from '../../modals/inquiry-create/inquiryCreateModalAtom';
import { useCurrentUserCachedData } from '../../../utils/hooks/useCurrentUserCachedData';
import { InquiryFilterCategories } from './filters/InquiryFilterCategories';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { useInquiriesQuery } from '../../../../graphql/generated-types';
import { InquiryFilterLocation } from './filters/InquiryFilterLocation';
import { inquiriesFiltersAtom } from './filters/inquiriesFiltersAtom';
import { InquiryFilterSearch } from './filters/InquiryFilterSearch';
import { useInquiriesFilter } from './filters/useInquiriesFilter';
import { InquiryFilterType } from './filters/InquiryFilterType';
import { PageActions } from '../../common/page/PageActions';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';
import { InquiryListItem } from './InquiryListItem';


export function InquiriesPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ filters, setFilters ] = useRecoilState(inquiriesFiltersAtom);
    const setInquiryCreateModalModalState = useSetRecoilState(inquiryCreateModalAtom);
    const { data, loading } = useInquiriesQuery();
    usePageLinearProgressRevealer(loading);
    const inquiries = data?.allInquiries;
    const userData = useCurrentUserCachedData();
    const filteredInquiries = useInquiriesFilter(inquiries || [], filters, userData);

    const handleInquiryCreateModalOpen = () => {
        setInquiryCreateModalModalState({ open: true });
    };

    return (
        <PageEnterTransition in={Array.isArray(inquiries)}>
            <Container maxWidth='lg'>

                <PageHeader>
                    <PageTitle>
                        {t('inquiry.inquiries')}
                    </PageTitle>
                    {userData && (
                        <PageActions>
                            <Tooltip title={t('inquiry.addInquiry')!}>
                                <IconButton onClick={handleInquiryCreateModalOpen} aria-label={t('inquiry.addInquiry')}>
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </PageActions>
                    )}
                </PageHeader>

                <div className={classes.filtersContainer} role='group' aria-label={t('inquiry.filters.inquiryFilters')}>

                    <InquiryFilterSearch
                        searchPhrase={filters.searchPhrase}
                        setFilters={setFilters}
                        className={classes.searchField}
                    />

                    <InquiryFilterLocation
                        location={filters.location}
                        setFilters={setFilters}
                        className={classes.locationField}
                    />

                    <InquiryFilterCategories
                        selectedCategories={filters.selectedCategories}
                        setFilters={setFilters}
                        className={classes.categoriesField}
                    />

                    {userData && (
                        <InquiryFilterType
                            selectedType={filters.selectedType}
                            setFilters={setFilters}
                            className={classes.typeField}
                        />
                    )}

                </div>

                <div>
                    {filteredInquiries?.map(({ inquiry, distance }) => (
                        <InquiryListItem
                            key={inquiry.id}
                            inquiry={inquiry}
                            distance={distance}
                            isOwned={userData?.slug === inquiry.author.userSlug}
                            isBookmarked={Boolean(userData?.bookmarkedInquiries?.includes(inquiry.id))}
                            userSlug={userData?.slug!}
                        />
                    ))}
                </div>

            </Container>
        </PageEnterTransition>
    );
}

const useStyles = makeStyles((theme) => ({
    filtersContainer: {
        marginBottom: theme.spacing(4),
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: `
            'search'
            'location'
            'categories'
            'type'
        `,
        gridGap: theme.spacing(1),
        gap: theme.spacing(1),

        [ theme.breakpoints.up('md') ]: {
            marginBottom: theme.spacing(6),
            gridTemplateColumns: '2fr 1fr',
            gridTemplateAreas: `
                'search location'
                'categories categories'
                'type type'
            `,
        },
    },
    searchField: {
        gridArea: 'search',
    },
    locationField: {
        margin: [ [ 0 ], '!important' ] as unknown as number,
        gridArea: 'location',
    },
    categoriesField: {
        gridArea: 'categories',
    },
    typeField: {
        gridArea: 'type',
    },
}));
