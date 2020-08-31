import React from 'react';
import { useTranslation } from 'react-i18next';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { makeStyles } from '@material-ui/core/styles';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';

import { ProductDataFragment } from '../../../../../graphql/generated-types';
import { stripDiacritics } from '../../../../utils/filters/filtersUtils';
import { ProductPreview } from '../../misc/ProductPreview';
import { NumberField } from '../number/NumberField';


export interface ProductAmountOption {
    product: ProductDataFragment;
    amount?: number;
}

export interface ProductSelectorProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    productOptions: ProductAmountOption[];
    value: ProductAmountOption[];
    onChange: (value: ProductAmountOption[]) => void;
}

export const ProductSelector = React.memo(
    function ProductSelector({ id, productOptions, value, onChange, disabled, ...rest }: ProductSelectorProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();
        const [ inputValue, setInputValue ] = React.useState<string>('');

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<ProductAmountOption, true, true, false>

                    id={id}
                    handleHomeEndKeys
                    disableClearable
                    openOnFocus
                    multiple
                    openText={t('form.common.open')}
                    closeText={t('form.common.close')}
                    noOptionsText={t('form.common.noOption')}

                    disabled={disabled}
                    inputValue={inputValue}
                    onInputChange={(event, value) => {
                        setInputValue(value);
                    }}
                    value={value}
                    onChange={(event, newValue) => {
                        onChange(newValue);
                        setInputValue('');
                    }}

                    options={productOptions}
                    filterSelectedOptions
                    getOptionSelected={isOptionSelected}
                    filterOptions={optionFilter}
                    renderOption={optionRenderer}
                    renderTags={tagsRenderer}

                    renderInput={({ InputProps, ...params }) => (
                        <TextField
                            {...rest}
                            {...params}
                            variant='filled'
                            InputProps={{ ...InputProps, disableUnderline: true }}
                        />
                    )}
                />
                <div>
                    {value.map(({ product, amount }) => (
                        <div key={product.id} className={classes.productRow} data-testid={`product-${product.id}`}>

                            <NumberField
                                value={amount}
                                onChange={(amount) => {
                                    onChange(value.map((option) => (
                                        (option.product === product)
                                            ? { product, amount }
                                            : option
                                    )));
                                }}
                                variant='filled'
                                className={classes.amountInput}
                                placeholder={t('form.roomProductSelector.productAmount.placeholder')}
                                InputProps={{
                                    classes: {
                                        input: classes.amountInputVeryDenseInput,
                                        root: classes.amountInputRoot,
                                    },
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <Typography>
                                                {t('form.roomProductSelector.productAmount.endAdornment')}
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                                numberInputProps={{
                                    decimalScale: 4,
                                    fixedDecimalScale: false,
                                }}
                                disabled={disabled}
                            />

                            <Button
                                variant='outlined'
                                title={t('form.roomProductSelector.deleteButton.title')}
                                aria-label={t('form.roomProductSelector.deleteButton.title')}
                                className={classes.removeButton}
                                onClick={() => {
                                    onChange(value.filter((option) => option.product !== product));
                                }}
                                disabled={disabled}
                            >
                                <ClearIcon />
                            </Button>

                            <ProductPreview product={product} className={classes.productPreview} />

                        </div>
                    ))}
                </div>
            </FormControl>
        );
    },
);

/**
 * Utils
 */

function isOptionSelected(option: ProductAmountOption, value: ProductAmountOption) {
    return option.product.id === value.product.id;
}

function optionFilter(options: ProductAmountOption[], { inputValue }: FilterOptionsState<ProductAmountOption>) {
    const normalizedInputValue = stripDiacritics(inputValue.trim().toLowerCase());
    return options.filter(({ product: { name, tags } }) => {
        const normalizedName = stripDiacritics(name.toLowerCase());
        return normalizedName.includes(normalizedInputValue)
            || tags?.some((tag) => isTagAffectsFilter(tag, normalizedInputValue));
    });
}

function isTagAffectsFilter(tag: string, normalizedInputValue: string) {
    const normalizedTag = stripDiacritics(tag.toLowerCase());
    return (normalizedInputValue && normalizedTag.includes(normalizedInputValue))
        || normalizedInputValue.includes(normalizedTag);
}


/**
 * Renderers
 */

function tagsRenderer() {
    // prevents from adding visible value to product selector
    return null;
}

function optionRenderer({ product }: ProductAmountOption, { inputValue }: AutocompleteRenderOptionState): React.ReactNode {
    const normalizedInputValue = stripDiacritics(inputValue.trim().toLowerCase());
    const matches = match(product.name, inputValue);
    const parts = parse(product.name, matches);

    return (
        <ProductPreview
            data-testid={`option-${product.id}`}
            product={product}
            component='div'
            nameRenderer={() => parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                    {part.text}
                </span>
            ))}
            isTagActive={(tag) => isTagAffectsFilter(tag, normalizedInputValue)}
        />
    );
}


const useStyles = makeStyles((theme) => ({
    productRow: {
        margin: theme.spacing(0.5, 1, 0),
        display: 'grid',
        gridTemplateColumns: '1fr 36px',
        gridTemplateAreas: `
            'amount remove'
            'preview preview'
        `,
    },
    amountInput: {
        gridArea: 'amount',
        margin: 0,
    },
    removeButton: {
        gridArea: 'remove',
        minWidth: 'unset',
        padding: 'unset',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        borderLeftWidth: 0,
        borderRadius: 0,
        borderTopRightRadius: theme.shape.borderRadius,
    },
    productPreview: {
        padding: theme.spacing(1),
        gridArea: 'preview',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: 0,
    },
    amountInputRoot: {
        borderRadius: 0,
        borderTopLeftRadius: theme.shape.borderRadius,
    },
    amountInputVeryDenseInput: {
        padding: 8,
    },
}));
