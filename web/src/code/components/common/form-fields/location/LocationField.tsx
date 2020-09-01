import React from 'react';
import { useTranslation } from 'react-i18next';
import parse from 'autosuggest-highlight/parse';

import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteProps } from '@material-ui/lab/Autocomplete';
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
    latLng?: google.maps.LatLngLiteral | null;
}

export interface LocationFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value' | 'classes'> {
    value: LocationOption | null;
    onChange: (value: LocationOption | null) => void;
    /**
     * @see google.maps.places.AutocompletionRequest.types
     */
    types?: string[];
    autocompleteClasses?: AutocompleteProps<LocationOption, false, false, false>['classes'];
}

export function LocationField({ id, value, onChange, disabled, types, className, autocompleteClasses, ...rest }: LocationFieldProps): React.ReactElement {
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
            setOptions([ ...newOptions, ...results.filter(({ place_id }) => place_id !== value?.place_id) ]);
        });

        return () => {
            getPlacePredictions.cancel();
        };
    }, [ value, inputValue, types, getPlacePredictions ]);

    return (
        <FormControl fullWidth margin='normal' className={className}>
            <Autocomplete<LocationOption, false, false, false>
                classes={autocompleteClasses}

                id={id}
                autoComplete
                handleHomeEndKeys
                openText={t('form.common.open')}
                closeText={t('form.common.close')}
                clearText={t('form.common.clear')}
                noOptionsText={t('form.common.noOption')}

                disabled={disabled}
                value={value}
                onChange={(event, newValue) => {
                    setOptions(newValue ? [ newValue, ...options ] : options);
                    onChange(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}

                options={options}
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
        <Grid container alignItems='center' spacing={2}>
            <Grid item>
                <LocationOnIcon color='primary' />
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
