import React from 'react';
import { useTranslation } from 'react-i18next';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { makeStyles } from '@material-ui/core/styles';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import ClearIcon from '@material-ui/icons/Clear';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import { InquiryDataFragment } from '../../../../../graphql/generated-types';
import { stripDiacritics } from '../../../../utils/filters/filtersUtils';
import { InquiryPreview } from '../../misc/InquiryPreview';
import { TagChip } from '../../misc/TagChip';


export interface InquiryOption extends InquiryDataFragment {
    translatedCategory: string;
}

export interface InquirySelectorProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    inquiryOptions: InquiryOption[];
    value: InquiryOption[];
    onChange: (value: InquiryOption[]) => void;
}

export const InquirySelector = React.memo(
    function InquirySelector({ id, inquiryOptions, value, onChange, disabled, ...rest }: InquirySelectorProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();
        const [ inputValue, setInputValue ] = React.useState<string>('');

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<InquiryOption, true, true, false>

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

                    options={inquiryOptions}
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
                    {value.map((inquiryOption) => (
                        <div key={inquiryOption.id} className={classes.inquiryRow} data-testid={`inquiry-${inquiryOption.id}`}>

                            <Paper variant='outlined' className={classes.filler} />

                            <Button
                                variant='outlined'
                                title={t('form.roomInquirySelector.deleteButton.title')}
                                aria-label={t('form.roomInquirySelector.deleteButton.title')}
                                className={classes.removeButton}
                                onClick={() => {
                                    onChange(value.filter((inquiry) => inquiryOption !== inquiry));
                                }}
                                disabled={disabled}
                            >
                                <ClearIcon />
                            </Button>

                            <InquiryPreview inquiry={inquiryOption} className={classes.inquiryPreview} />

                        </div>
                    ))}
                </div>
            </FormControl>
        );
    }
)

/**
 * Utils
 */

function isOptionSelected(option: InquiryOption, value: InquiryOption) {
    return option.id === value.id;
}

function optionFilter(options: InquiryOption[], { inputValue }: FilterOptionsState<InquiryOption>) {
    const normalizedInputValue = stripDiacritics(inputValue.trim().toLowerCase());
    return options.filter(({ title, translatedCategory }) => {
        const normalizedTitle = stripDiacritics(title.toLowerCase());
        return normalizedTitle.includes(normalizedInputValue)
            || isCategoryAffectsFilter(translatedCategory, normalizedInputValue);
    });
}

function isCategoryAffectsFilter(translatedCategory: string, normalizedInputValue: string) {
    const normalizedCategory = stripDiacritics(translatedCategory.toLowerCase());
    return (normalizedInputValue && normalizedCategory.includes(normalizedInputValue))
        || normalizedInputValue.includes(normalizedCategory);
}


/**
 * Renderers
 */

function tagsRenderer() {
    // prevents from adding visible value to inquiry selector
    return null;
}

function optionRenderer(option: InquiryOption, { inputValue }: AutocompleteRenderOptionState): React.ReactNode {
    const normalizedInputValue = stripDiacritics(inputValue.trim().toLowerCase());
    const matches = match(option.title, inputValue);
    const parts = parse(option.title, matches);

    return (
        <div data-testid={`option-${option.id}`}>
            <Typography>
                {parts.map((part, index) => (
                    <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                        {part.text}
                    </span>
                ))}
            </Typography>
            <div>
                <TagChip
                    label={option.translatedCategory}
                    color={isCategoryAffectsFilter(option.translatedCategory, normalizedInputValue) ? 'primary' : 'default'}
                />
            </div>
        </div>
    );
}


const useStyles = makeStyles((theme) => ({
    inquiryRow: {
        margin: theme.spacing(0.5, 1, 0),
        display: 'grid',
        gridTemplateColumns: '1fr 37px',
        gridTemplateAreas: `
            'filler remove'
            'preview preview'
        `,
    },
    filler: {
        gridArea: 'filler',
        borderRadius: 0,
        borderTopLeftRadius: theme.shape.borderRadius,
        borderRightWidth: 0,
    },
    removeButton: {
        gridArea: 'remove',
        minWidth: 'unset',
        padding: 'unset',
        height: 37,
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 0,
        borderTopRightRadius: theme.shape.borderRadius,
    },
    inquiryPreview: {
        gridArea: 'preview',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: 0,
    },
}));
