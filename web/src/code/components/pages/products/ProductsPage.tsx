import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useSetRecoilState } from 'recoil/dist';

import { darken, lighten, makeStyles, Theme } from '@material-ui/core/styles';
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
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';

import { mapProductToProductUpdateFormData, productUpdateModalAtom } from '../../modals/product-update/productUpdateModalAtom';
import { isOptionExclusivelySelected, SelectedOptions } from '../../../utils/filters/filtersUtils';
import { RichTextPreviewer } from '../../common/form-fields/ritch-text-editor/RichTextPreviewer';
import { useCurrentUserDataSelectors } from '../../../utils/hooks/useCurrentUserDataSelectors';
import { productCreateModalAtom } from '../../modals/product-create/productCreateModalAtom';
import { productDeleteModalAtom } from '../../modals/product-delete/productDeleteModalAtom';
import { PageEnterTransition } from '../../common/page/PageEnterTransition';
import { productsFiltersAtom } from './filters/productsFiltersAtom';
import { ProductFilterSearch } from './filters/ProductFilterSearch';
import { formatAmount } from '../../../config/supportedCurrencies';
import { ProductFilterDate } from './filters/ProductFilterDate';
import { ProductFilterTags } from './filters/ProductFilterTags';
import { useProductsFilter } from './filters/useProductsFilter';
import { HistoryButton } from '../../common/misc/HistoryButton';
import { Product } from '../../../../graphql/generated-types';
import { ThemeType } from '../../../utils/theme/ThemeUtils';
import { PageActions } from '../../common/page/PageActions';
import { ExpandIcon } from '../../common/icons/ExpandIcon';
import { PageHeader } from '../../common/page/PageHeader';
import { PageTitle } from '../../common/page/PageTitle';


export function ProductsPage(): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ filters, setFilters ] = useRecoilState(productsFiltersAtom);
    const setProductCreateModalModalState = useSetRecoilState(productCreateModalAtom);
    const [ { tags, dates }, userCachedData ] = useCurrentUserDataSelectors();
    const products = userCachedData?.products;
    const filteredProducts = useProductsFilter(products || [], filters);

    const handleProductCreateModalOpen = () => {
        setProductCreateModalModalState({ open: true });
    };

    return (
        <PageEnterTransition>
            <Container maxWidth='lg'>

                <PageHeader>
                    <PageTitle>
                        {t('product.products')}
                    </PageTitle>
                    <PageActions>
                        <Tooltip title={t('product.addProduct')!}>
                            <IconButton onClick={handleProductCreateModalOpen} aria-label={t('product.addProduct')}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </PageActions>
                </PageHeader>

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
        </PageEnterTransition>
    );
}

export interface ProductListItemProps {
    product: Product;
    selectedTags: SelectedOptions;
}

const productExpansionStateMemory = new WeakMap<Product, boolean>();

export function ProductListItem({ product, selectedTags }: ProductListItemProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const [ expanded, setExpanded ] = React.useState(Boolean(productExpansionStateMemory.get(product)));
    const setDeleteModalState = useSetRecoilState(productDeleteModalAtom);
    const setUpdateModalState = useSetRecoilState(productUpdateModalAtom);

    const handleToggle = () => {
        setExpanded(!expanded);
        productExpansionStateMemory.set(product, !expanded);
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
                            color={isOptionExclusivelySelected(selectedTags, tag) ? 'primary' : 'default'}
                            className={classes.productTag}
                        />
                    ))}
                </div>

            </AccordionSummary>

            <AccordionDetails classes={{ root: classes.AccordionDetailsRoot }}>
                <RichTextPreviewer value={product.description} />
            </AccordionDetails>

            <AccordionActions>
                <HistoryButton
                    createdAt={product.createdAt}
                    updatedAt={product.updatedAt}
                    ariaLabel={t('product.productHistory')}
                    className={classes.historyButton}
                />
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
}));
