import React from 'react';
import { SetterOrUpdater } from 'recoil/dist';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Chip from '@material-ui/core/Chip';

import { areAllTagsSelected, isTagExclusivelySelected, isTagSelected } from './productsFiltersUtils';
import { Tag } from '../../../../utils/hooks/useCurrentUserDataSelectors';
import { ProductsFiltersAtomValue } from './productsFiltersAtom';


export interface ProductFilterTagsProps {
    tags: Tag[];
    selectedTags: ProductsFiltersAtomValue['selectedTags'];
    setFilters: SetterOrUpdater<ProductsFiltersAtomValue>;
    className: string;
}

export const ProductFilterTags = React.memo(
    function ProductFilterTags({ tags, selectedTags, setFilters, className }: ProductFilterTagsProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();

        return (
            <div className={className} role='group' aria-label={t('product.filters.tagsAriaLabel')}>
                <Chip
                    label={t('product.filters.selectAllTags')}

                    icon={<DoneAllIcon />}
                    color={areAllTagsSelected(selectedTags) ? 'primary' : 'default'}
                    className={classes.productTag}
                    variant='outlined'
                    size='small'
                    clickable

                    role='checkbox'
                    aria-checked={areAllTagsSelected(selectedTags)}

                    onClick={() => {
                        setFilters((prev) => ({
                            ...prev,
                            selectedTags: areAllTagsSelected(selectedTags) ? new Set() : 'ALL',
                        }));
                    }}
                />
                {
                    tags.map(({ name: tagName, occurrenceCount }) => (
                        <Chip
                            key={tagName}
                            label={(
                                <>
                                    <Typography variant='inherit'>{tagName}</Typography>
                                    <Typography
                                        variant='inherit'
                                        color='textSecondary'
                                        className={classes.occurrenceCount}
                                    >
                                        {`(${occurrenceCount})`}
                                    </Typography>
                                </>
                            )}

                            color={isTagSelected(selectedTags, tagName) ? 'primary' : 'default'}
                            className={classes.productTag}
                            variant='outlined'
                            size='small'
                            clickable

                            role='checkbox'
                            aria-checked={isTagSelected(selectedTags, tagName)}
                            aria-label={t('product.filters.toggleTag', { tagName })}

                            onClick={() => {
                                setFilters((prev) => ({
                                    ...prev,
                                    selectedTags: toggleTag(tags, selectedTags, tagName),
                                }));
                            }}
                        />
                    ))
                }
            </div>
        );
    },
);

function toggleTag(tags: Tag[], selectedTags: ProductsFiltersAtomValue['selectedTags'], tagName: string): ProductsFiltersAtomValue['selectedTags'] {
    // 'ALL' - tag
    if (areAllTagsSelected(selectedTags)) {
        const newSelectedTags = new Set(tags.map(({ name }) => name));
        newSelectedTags.delete(tagName);
        return newSelectedTags;
    }
    // [...tags] - tag
    if (isTagExclusivelySelected(selectedTags, tagName)) {
        const newSelectedTags = new Set(selectedTags);
        newSelectedTags.delete(tagName);
        return newSelectedTags;
    }
    // [...allButOneTags] + tag
    if (selectedTags.size === tags.length - 1) {
        return 'ALL';
    }
    // [...tags] + tag
    const newSelectedTags = new Set(selectedTags);
    newSelectedTags.add(tagName);
    return newSelectedTags;
}

const useStyles = makeStyles({
    productTag: {
        marginTop: 3,
        marginRight: 3,
    },
    occurrenceCount: {
        marginLeft: 4,
    },
});
