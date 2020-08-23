import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldHelperProps, useField, useFormikContext } from 'formik';

import TextField from '@material-ui/core/TextField';

import { roomTypeConfigMap, supportedRoomTypes } from '../../../../config/supportedRoomTypes';
import { RoomType } from '../../../../../graphql/generated-types';
import { FormikTextFieldProps } from '../FormikTextField';


export interface FormikRoomNameAutocompleteFieldProps extends Omit<FormikTextFieldProps, 'optional'> {
    name: string;
    roomType: RoomType | null;
}

/**
 * Autocompletes room name based on selected room type.
 */
export function FormikRoomNameAutocompleteField({ name, roomType, InputProps, ...rest }: FormikRoomNameAutocompleteFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ field, meta, { setValue } ] = useField<string>(name);
    const errorMessage = meta.touched ? meta.error : undefined;
    useRoomNameAutocomplete(roomType, field.value, setValue);

    return (
        <TextField
            {...rest}
            {...field}

            id={rest.id || field.name}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}
            InputProps={{ ...InputProps, disableUnderline: true }}

            variant='filled'
            margin='normal'
        />
    );
}

function useRoomNameAutocomplete(roomType: RoomType | null, currentRoomName: string, setValue: FieldHelperProps<string>['setValue']) {
    const { t } = useTranslation();
    const prevRoomType = React.useRef<RoomType | null>(roomType);
    const autocomplete = React.useMemo(() => {
        const roomTypeSuggestionMap = supportedRoomTypes.reduce((map, type) => (
            map.set(type, t(roomTypeConfigMap[ type ].tKey))
        ), new Map<RoomType | null, string>());
        roomTypeSuggestionMap.set(null, '');
        const suggestionsSet = new Set(roomTypeSuggestionMap.values());
        return { roomTypeSuggestionMap, suggestionsSet };
    }, [ t ]);

    React.useEffect(() => {
        if (roomType !== prevRoomType.current) {
            if (autocomplete.suggestionsSet.has(currentRoomName!)) {
                const suggestion = autocomplete.roomTypeSuggestionMap.get(roomType)!;
                setValue(suggestion);
            }
            prevRoomType.current = roomType;
        }
    }, [ roomType, setValue, currentRoomName, autocomplete ]);
}
