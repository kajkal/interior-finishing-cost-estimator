import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil/dist';

import { makeStyles, Theme } from '@material-ui/core/styles';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionActions from '@material-ui/core/AccordionActions';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Accordion from '@material-ui/core/Accordion';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import HistoryIcon from '@material-ui/icons/History';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import { mapProductToProductUpdateFormData, productUpdateModalAtom } from '../../modals/product-update/productUpdateModalAtom';
import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { useCurrentUserDataSelectors } from '../../../utils/hooks/useCurrentUserDataSelectors';
import { productsFiltersAtom, ProductsFiltersAtomValue } from './filters/productsFiltersAtom';
import { productDeleteModalAtom } from '../../modals/product-delete/productDeleteModalAtom';
import { isTagExclusivelySelected, productFilter } from './filters/productsFiltersUtils';
import { ProductFilterSearch } from './filters/ProductFilterSearch';
import { formatAmount } from '../../../config/supportedCurrencies';
import { ProductFilterDate } from './filters/ProductFilterDate';
import { ProductFilterTags } from './filters/ProductFilterTags';
import { Product } from '../../../../graphql/generated-types';
import { ExpandIcon } from '../../common/icons/ExpandIcon';
import { ProductsPageHeader } from './ProductsPageHeader';


export function ProductsPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ filters, setFilters ] = useRecoilState(productsFiltersAtom);
    const [ { tags, dates }, userCachedData ] = useCurrentUserDataSelectors();
    const products = userCachedData?.products;
    const filteredProducts = React.useMemo(() => productFilter(products || [], filters), [ products, filters ]);

    return (
        <Container maxWidth='lg'>

            <ProductsPageHeader />

            <div className={classes.filtersContainer} role='group' aria-label={t('product.filters.productFilters')}>

                <ProductFilterSearch
                    searchPhrase={filters.searchPhrase}
                    setFilters={setFilters}
                    className={classes.searchField}
                />

                <ProductFilterDate
                    date={filters.fromDate}
                    relatedField='fromDate'
                    productsDatesStatistics={dates()}
                    setFilters={setFilters}
                    className={classes.afterDateField}
                />

                <ProductFilterDate
                    date={filters.toDate}
                    relatedField='toDate'
                    productsDatesStatistics={dates()}
                    setFilters={setFilters}
                    className={classes.beforeDateField}
                />

                <ProductFilterTags
                    tags={tags()}
                    selectedTags={filters.selectedTags}
                    setFilters={setFilters}
                    className={classes.tagsField}
                />

            </div>

            <div>
                {
                    filteredProducts.map((product) => (
                        <ProductListItem key={product.id} product={product} selectedTags={filters.selectedTags} />
                    ))
                }
            </div>

        </Container>
    );
}

export interface ProductListItemProps {
    product: Product;
    selectedTags: ProductsFiltersAtomValue['selectedTags'];
}

export function ProductListItem({ product, selectedTags }: ProductListItemProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const [ expanded, setExpanded ] = React.useState(false);
    const setDeleteModalState = useSetRecoilState(productDeleteModalAtom);
    const setUpdateModalState = useSetRecoilState(productUpdateModalAtom);

    const handleToggle = () => {
        setExpanded(!expanded);
    };

    const handleDelete = () => {
        setDeleteModalState({
            open: true,
            productData: {
                id: product.id,
                name: product.name,
            },
        });
    };

    const handleEdit = () => {
        setUpdateModalState({
            open: true,
            productData: mapProductToProductUpdateFormData(product),
        });
    };

    const historyTooltip = (
        <div className={classes.datesContainer}>
            <Typography variant='caption'>
                {t('product.created')}
            </Typography>
            <Typography variant='caption'>
                {DateTime.fromISO(product.createdAt).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_MED)}
            </Typography>
            {product.updatedAt && (
                <>
                    <Typography variant='caption'>
                        {t('product.updated')}
                    </Typography>
                    <Typography variant='caption'>
                        {DateTime.fromISO(product.updatedAt).setLocale(i18n.language).toLocaleString(DateTime.DATETIME_MED)}
                    </Typography>
                </>
            )}
        </div>
    );

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
                id={`${product.id}-header`}
                aria-controls={`${product.id}-content`}
                classes={{
                    content: classes.MuiAccordionSummaryContent,
                }}
            >

                <Typography className={classes.productName}>
                    {product.name}
                </Typography>

                {(product.price) && (
                    <div className={classes.productPrice}>
                        <Typography>
                            {formatAmount(product.price)}
                        </Typography>
                        <Typography className={classes.productPriceCurrency} variant='caption'>
                            {product.price.currency}
                        </Typography>
                    </div>
                )}

                <ExpandIcon className={classes.expandIcon} expanded={expanded} />

                <div className={classes.productTags}>
                    {product.tags?.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            size='small'
                            variant='outlined'
                            color={isTagExclusivelySelected(selectedTags, tag) ? 'primary' : 'default'}
                            className={classes.productTag}
                        />
                    ))}
                </div>

            </AccordionSummary>

            <AccordionDetails classes={{ root: classes.AccordionDetailsRoot }}>
                <RichTextPreviewer value={product.description} />
            </AccordionDetails>

            <AccordionActions>
                <Tooltip title={historyTooltip}>
                    <IconButton size='small' className={classes.historyButton} aria-label={t('product.productHistory')}>
                        <HistoryIcon />
                    </IconButton>
                </Tooltip>
                <Button variant='outlined' size='small' onClick={handleDelete} startIcon={<DeleteIcon />}>
                    {t('form.common.delete')}
                </Button>
                <Button variant='outlined' size='small' color='primary' onClick={handleEdit} startIcon={<EditIcon />}>
                    {t('form.common.update')}
                </Button>
            </AccordionActions>
        </Accordion>
    );
}


const useStyles = makeStyles((theme: Theme) => ({
    filtersContainer: {
        marginBottom: theme.spacing(4),
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: `
            'search'
            'afterDate'
            'beforeDate'
            'tags'
        `,
        gridGap: theme.spacing(1),
        gap: theme.spacing(1),

        [ theme.breakpoints.up('sm') ]: {
            gridTemplateColumns: '1fr 1fr',
            gridTemplateAreas: `
                'search search'
                'afterDate beforeDate'
                'tags tags'
            `,
        },

        [ theme.breakpoints.up('md') ]: {
            marginBottom: theme.spacing(6),
            gridTemplateColumns: '1fr auto auto',
            gridTemplateAreas: `
                'search afterDate beforeDate'
                'tags tags tags'
            `,
        },
    },
    searchField: {
        gridArea: 'search',
    },
    afterDateField: {
        gridArea: 'afterDate',
    },
    beforeDateField: {
        gridArea: 'beforeDate',
    },
    tagsField: {
        gridArea: 'tags',
    },

    MuiAccordionRoot: {
        border: '1px solid transparent',
        boxShadow: 'unset',
        '&$MuiAccordionExpanded': {
            borderColor: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
        },
    },
    MuiAccordionExpanded: {},
    MuiAccordionSummaryContent: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gridTemplateAreas: `
            'name price icon'
            'tags tags tags'
        `,
    },
    productName: {
        gridArea: 'name',
    },
    productPrice: {
        gridArea: 'price',
        marginLeft: 'auto',
        display: 'flex',
    },
    productPriceCurrency: {
        verticalAlign: 'super',
        marginLeft: 5,
    },
    expandIcon: {
        gridArea: 'icon',
        marginLeft: theme.spacing(2),
    },
    productTags: {
        gridArea: 'tags',
    },
    productTag: {
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
    datesContainer: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridColumnGap: theme.spacing(1),
        columnGap: theme.spacing(1),
    },
}));
