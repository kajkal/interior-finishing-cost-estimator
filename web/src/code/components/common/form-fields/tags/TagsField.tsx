import React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, { AutocompleteRenderOptionState, createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';


export interface TagOption {
    name: string;
    /**
     * Label is present only in options added by user.
     * Example option added by user: {name: 'new tag', label: 'Add tag "new tag"'}.
     */
    label?: string;
}

export interface TagsFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    definedTagOptions: TagOption[];
    value: TagOption[];
    onChange: (value: TagOption[]) => void;
}

const filter = createFilterOptions<TagOption>();

export const TagsField = React.memo(
    function TagsField({ id, definedTagOptions, value, onChange, disabled, ...rest }: TagsFieldProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<TagOption, true, false, true>
                    classes={{
                        inputRoot: (value.length) ? classes.inputWithTags : undefined,
                        paper: classes.paper,
                    }}

                    id={id}
                    freeSolo
                    multiple
                    handleHomeEndKeys
                    openOnFocus
                    clearText={t('form.common.tags.clear')}

                    disabled={disabled}
                    value={value}
                    onChange={(event, newValue) => {
                        onChange(newValue
                            .map((item) => (typeof item === 'string') ? createNewTagOption(item, value, t) : item)
                            .filter(isValidTagOption));
                    }}

                    options={definedTagOptions}
                    filterSelectedOptions
                    getOptionSelected={isOptionSelected}
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);

                        // Suggest the creation of a new value
                        if (params.inputValue.trim() !== '') {
                            const newTagSuggestion = createNewTagOption(params.inputValue, value, t);
                            newTagSuggestion && filtered.push(newTagSuggestion);
                        }

                        return filtered;
                    }}
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

                    renderTags={(value, getTagProps) =>
                        value.map((option, index: number) => (
                            <Chip
                                {...getTagProps({ index })}
                                variant='outlined'
                                label={option.name}
                                icon={
                                    (option.label)
                                        ? <Tooltip title={t('form.common.tags.newTag')!}><NewReleasesIcon /></Tooltip>
                                        // ? <NewReleasesIcon titleAccess={t('form.common.tags.newTag')}/>
                                        : undefined
                                }
                            />
                        ))
                    }

                />
            </FormControl>
        );
    },
);

/**
 * Utils
 */

function getOptionLabel(option: TagOption): string {
    return option.label || option.name;
}

function createNewTagOption(inputValue: string, selectedOptions: TagOption[], t: TFunction): TagOption | null {
    const tagName = inputValue.trim();
    return (tagName && isNewTagOptionUnique(tagName, selectedOptions))
        ? {
            name: tagName,
            label: t('form.common.tags.addTag', { tagName: tagName }),
        }
        : null;
}

function isNewTagOptionUnique(newOptionName: string, selectedOptions: TagOption[]): boolean {
    return !selectedOptions.some(({ name }) => name === newOptionName);
}

function isValidTagOption(option: TagOption | undefined | null): option is TagOption {
    return Boolean(option);
}

function isOptionSelected(option: TagOption, value: TagOption) {
    return option.name === value.name;
}


/**
 * Renderers
 */

function optionRenderer(option: TagOption, { inputValue }: AutocompleteRenderOptionState): React.ReactNode {
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
    inputWithTags: {
        padding: [ [ 28, 39, 5, 8 ], '!important' ] as unknown as number,
    },
    paper: {
        // in order to cover input borders
        width: 'calc(100% + 2px)',
        marginLeft: -1,
    },
});
