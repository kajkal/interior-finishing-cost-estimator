import React from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'autosuggest-highlight/parse';

import { makeStyles } from '@material-ui/core/styles';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { useLazyAutocompleteService } from '../../../../utils/google-maps/useLazyAutocompleteService';


/**
 * Required fields from google.maps.places.AutocompletePrediction
 */
export interface LocationOption {
    place_id: google.maps.places.AutocompletePrediction['place_id'],
    description: google.maps.places.AutocompletePrediction['description'];
    structured_formatting: {
        main_text: google.maps.places.AutocompleteStructuredFormatting['main_text'];
        secondary_text: google.maps.places.AutocompleteStructuredFormatting['secondary_text'];
        main_text_matched_substrings: google.maps.places.AutocompleteStructuredFormatting['main_text_matched_substrings'];
    };
    // defined only for objects mapped from Location object from server:
    lat?: number;
    lng?: number;
}

export interface LocationFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    value: LocationOption | null;
    onChange: (value: LocationOption | null) => void;
    /**
     * @see google.maps.places.AutocompletionRequest.types
     */
    types?: string[];
}

export function LocationField({ id, value, onChange, disabled, types, ...rest }: LocationFieldProps): React.ReactElement {
    const classes = useStyles();
    const { t, i18n } = useTranslation();
    const [ inputValue, setInputValue ] = React.useState('');
    const [ options, setOptions ] = React.useState<LocationOption[]>([]);
    const { getPlacePredictions } = useLazyAutocompleteService(i18n.language);

    React.useEffect(() => {
        if (!getPlacePredictions) {
            return undefined;
        }

        if (inputValue === '') {
            setOptions(value ? [ value ] : []);
            return undefined;
        }

        getPlacePredictions({ input: inputValue, types }, (results) => {
            const newOptions = (value) ? [ value ] : [];
            setOptions([ ...newOptions, ...results ]);
        });

        return () => {
            getPlacePredictions.cancel();
        };
    }, [ value, inputValue, types, getPlacePredictions ]);

    return (
        <FormControl fullWidth margin='normal'>
            <Autocomplete<LocationOption, false, false, false>
                classes={{
                    paper: classes.paper,
                }}

                id={id}
                autoComplete
                handleHomeEndKeys
                clearText={t('form.common.tags.clear')}
                noOptionsText={t('form.common.noOption')}

                disabled={disabled}
                value={value}
                onChange={(event, newValue) => {
                    setOptions(newValue ? [ newValue, ...options ] : options);
                    onChange(newValue);
                }}
                includeInputInList
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}

                options={options}
                filterSelectedOptions
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
}

/**
 * Utils
 */

function getOptionLabel(option: LocationOption): string {
    return option.description;
}

function isOptionSelected(option: LocationOption, value: LocationOption) {
    return option.place_id === value.place_id;
}


/**
 * Renderers
 */

function optionRenderer(option: LocationOption): React.ReactNode {
    const matches = option.structured_formatting.main_text_matched_substrings || [];
    const parts = parse(
        option.structured_formatting.main_text,
        matches.map((match) => [ match.offset, match.offset + match.length ]),
    );

    return (
        <Grid container alignItems='center'>
            <Grid item>
                <LocationOnIcon color='primary' style={{ marginRight: 16 }} />
            </Grid>
            <Grid item xs>
                {parts.map((part, index) => (
                    <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                        {part.text}
                    </span>
                ))}
                <Typography variant='body2' color='textSecondary'>
                    {option.structured_formatting.secondary_text}
                </Typography>
            </Grid>
        </Grid>
    );
}


const useStyles = makeStyles({
    paper: {
        // in order to cover input borders
        width: 'calc(100% + 2px)',
        marginLeft: -1,
    },
});
