import React from 'react';
import { useTranslation } from 'react-i18next';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField, { FilledTextFieldProps } from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';

import { roomTypeConfigMap, supportedRoomTypes } from '../../../../config/supportedRoomTypes';
import { RoomType } from '../../../../../graphql/generated-types';


export interface RoomTypeFieldProps extends Omit<FilledTextFieldProps, 'variant' | 'onChange' | 'value'> {
    value: RoomType | null;
    onChange: (value: RoomType | null) => void;
}

export const RoomTypeField = React.memo(
    function RoomTypeField({ id, value, onChange, disabled, ...rest }: RoomTypeFieldProps): React.ReactElement {
        const { t } = useTranslation();

        return (
            <FormControl fullWidth margin='normal'>
                <Autocomplete<RoomType, false, false, false>

                    id={id}
                    handleHomeEndKeys
                    openOnFocus
                    autoSelect
                    clearText={t('form.common.tags.clear')}
                    noOptionsText={t('form.common.noOption')}

                    disabled={disabled}
                    value={value}
                    onChange={(event, newValue) => {
                        onChange(newValue);
                    }}

                    options={supportedRoomTypes}
                    getOptionLabel={(option) => t(roomTypeConfigMap[ option ].tKey)}
                    renderOption={(option, { inputValue }) => {
                        const { tKey, Icon } = roomTypeConfigMap[ option ];
                        const optionLabel = t(tKey);
                        const matches = match(optionLabel, inputValue);
                        const parts = parse(optionLabel, matches);

                        return (
                            <Grid container alignItems='center' spacing={2}>
                                <Grid item>
                                    <Icon fontSize='large' />
                                </Grid>
                                <Grid item xs>
                                    {parts.map((part, index) => (
                                        <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                            {part.text}
                                        </span>
                                    ))}
                                </Grid>
                            </Grid>
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
