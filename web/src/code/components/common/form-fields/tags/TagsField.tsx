import React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';


export interface TagOption {
    name: string;
    label?: string;
    inputValue?: string;
}

export interface TagsFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    definedTagOptions: TagOption[];
    value: TagOption[];
    onChange: (value: TagOption[]) => void;
}

const filter = createFilterOptions<TagOption>();

export function TagsField({ id, definedTagOptions, value, onChange, disabled, ...rest }: TagsFieldProps): React.ReactElement {
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

                disabled={disabled}
                value={value}
                onChange={(event, newValue) => {
                    onChange(newValue
                        .map((item) => (typeof item === 'string') ? createNewTagOption(item, t) : item)
                        .filter(isValidTagOption));
                }}

                options={definedTagOptions}
                getOptionLabel={(option) => option.name}
                renderOption={(option, { inputValue }) => {
                    const matches = match(option.name, inputValue);
                    const parts = parse(option.name, matches);
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
                filterSelectedOptions
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    // Suggest the creation of a new value
                    if (params.inputValue.trim() !== '') {
                        filtered.push(createNewTagOption(params.inputValue, t)!);
                    }

                    return filtered;
                }}

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
                            label={option.inputValue || option.name}
                            icon={
                                (option.inputValue)
                                    ? <Tooltip arrow title={t('form.common.tags.newTag')!}><NewReleasesIcon /></Tooltip>
                                    // ? <NewReleasesIcon titleAccess={t('form.common.tags.newTag')}/>
                                    : undefined
                            }
                        />
                    ))
                }

            />
        </FormControl>
    );
}


function createNewTagOption(inputValue: string, t: TFunction): TagOption | null {
    const tagName = inputValue.trim();
    return tagName ? {
        inputValue: tagName,
        name: t('form.common.tags.addTag', { tagName: tagName }),
    } : null;
}

function isValidTagOption(option: TagOption | undefined | null): option is TagOption {
    return Boolean(option);
}


const useStyles = makeStyles({
    inputWithTags: {
        padding: [ [ 24, 39, 5, 8 ], '!important' ] as unknown as number,
    },
    paper: {
        // in order to cover input borders
        width: 'calc(100% + 2px)',
        marginLeft: -1,
    },
});