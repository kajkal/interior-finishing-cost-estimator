import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import FaceIcon from '@material-ui/icons/Face';
import Chip from '@material-ui/core/Chip';

import { InquiriesFiltersAtomValue } from './inquiriesFiltersAtom';


export interface InquiryFilterTypeProps {
    selectedType: 'OWNED' | 'BOOKMARKED' | null;
    setFilters: SetterOrUpdater<InquiriesFiltersAtomValue>;
    className: string;
}

export function InquiryFilterType({ selectedType, setFilters, className }: InquiryFilterTypeProps): React.ReactElement {
    const { t } = useTranslation();
    const types = [
        {
            type: 'OWNED',
            label: t('inquiry.filters.myInquiries'),
            ariaLabel: t('inquiry.filters.myInquiriesAriaLabel'),
            Icon: FaceIcon,
        },
        {
            type: 'BOOKMARKED',
            label: t('inquiry.filters.bookmarkedInquiries'),
            ariaLabel: t('inquiry.filters.bookmarkedInquiriesAriaLabel'),
            Icon: BookmarksIcon,
        },
    ] as const;

    return (
        <div className={className} role='group' aria-label={t('inquiry.filters.typesAriaLabel')}>
            {
                types.map((props, index) => (
                    <TypeChip
                        key={index}
                        selectedType={selectedType}
                        onSelect={(selectedType) => {
                            setFilters((prev) => ({ ...prev, selectedType }));
                        }}
                        {...props}
                    />
                ))
            }
        </div>
    );
}


export interface TypeChipProps {
    selectedType: 'OWNED' | 'BOOKMARKED' | null;
    type: 'OWNED' | 'BOOKMARKED';
    onSelect: (selectedType: 'OWNED' | 'BOOKMARKED' | null) => void;
    label: string;
    ariaLabel: string;
    Icon: React.ComponentType;
}

export function TypeChip({ selectedType, type, onSelect, label, ariaLabel, Icon }: TypeChipProps): React.ReactElement {
    const classes = useStyles();
    const selected = (selectedType === type);

    return (
        <Chip
            label={label}
            aria-label={ariaLabel}

            icon={<Icon />}
            color={selected ? 'secondary' : 'default'}
            className={classes.optionChip}
            variant='outlined'
            size='small'
            clickable

            role='checkbox'
            aria-checked={selected}

            onClick={() => onSelect(selected ? null : type)}
        />
    );
}


const useStyles = makeStyles({
    optionChip: {
        marginTop: 3,
        marginRight: 3,
    },
});


