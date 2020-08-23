import React from 'react';
import { useTranslation } from 'react-i18next';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';

import { categoryConfigMap, supportedCategories } from '../../../../config/supportedCategories';
import { Category } from '../../../../../graphql/generated-types';


export interface CategoryFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    value: Category | null;
    onChange: (value: Category | null) => void;
}

export const CategoryField = React.memo(
    function CategoryField({ id, value, onChange, disabled, ...rest }: CategoryFieldProps): React.ReactElement {
        const { t } = useTranslation();

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<Category, false, false, false>

                    id={id}
                    handleHomeEndKeys
                    openOnFocus
                    autoSelect
                    openText={t('form.common.open')}
                    closeText={t('form.common.close')}
                    clearText={t('form.common.clear')}
                    noOptionsText={t('form.common.noOption')}

                    disabled={disabled}
                    value={value}
                    onChange={(event, newValue) => {
                        onChange(newValue);
                    }}

                    options={supportedCategories}
                    getOptionLabel={(option) => t(categoryConfigMap[ option ].tKey)}
                    renderOption={(option, { inputValue }) => {
                        const optionLabel = t(categoryConfigMap[ option ].tKey);
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
                    }}

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
