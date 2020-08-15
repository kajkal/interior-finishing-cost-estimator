import React from 'react';
import { useTranslation } from 'react-i18next';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { makeStyles } from '@material-ui/core/styles';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';

import { categoryTranslationKeyMap, supportedCategories } from '../../../../config/supportedCategories';
import { Category } from '../../../../../graphql/generated-types';


export interface CategoryOption {
    id: Category;
    label: string;
}

export interface CategoryFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    value: CategoryOption | null;
    onChange: (value: CategoryOption | null) => void;
}

export const CategoryField = React.memo(
    function CategoryField({ id, value, onChange, disabled, ...rest }: CategoryFieldProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();
        const definedCategoryOptions = React.useMemo(() => (
            supportedCategories.map((category) => ({
                id: category,
                label: t(categoryTranslationKeyMap[ category ]),
            }))
        ), [ t ]);

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<CategoryOption, false, false, false>
                    classes={{
                        paper: classes.paper,
                    }}

                    id={id}
                    handleHomeEndKeys
                    openOnFocus
                    clearText={t('form.common.tags.clear')}

                    disabled={disabled}
                    value={value}
                    onChange={(event, newValue) => {
                        onChange(newValue);
                    }}

                    options={definedCategoryOptions}
                    getOptionSelected={isOptionSelected}
                    getOptionLabel={getOptionLabel}
                    renderOption={optionRenderer}

                    renderInput={({ InputProps, ...params }) => (
                        <TextField
                            {...rest}
                            {...params}
                            variant='filled'
                            InputProps={{ ...InputProps, disableUnderline: true }}
                        />
                    )}
                />
            </FormControl>
        );
    },
);

/**
 * Utils
 */

function getOptionLabel(option: CategoryOption): string {
    return option.label;
}

function isOptionSelected(option: CategoryOption, value: CategoryOption) {
    return option.id === value.id;
}


/**
 * Renderers
 */

function optionRenderer(option: CategoryOption, { inputValue }: AutocompleteRenderOptionState): React.ReactNode {
    const optionLabel = getOptionLabel(option);
    const matches = match(optionLabel, inputValue);
    const parts = parse(optionLabel, matches);

    return (
        <div>
            {parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                    {part.text}
                </span>
            ))}
        </div>
    );
}


const useStyles = makeStyles({
    paper: {
        // in order to cover input borders
        width: 'calc(100% + 2px)',
        marginLeft: -1,
    },
});
