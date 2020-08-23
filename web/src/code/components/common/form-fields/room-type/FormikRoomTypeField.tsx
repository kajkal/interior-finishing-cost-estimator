import React from 'react';
import { useField, useFormikContext } from 'formik';

import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { RoomTypeField, RoomTypeFieldProps } from './RoomTypeField';
import { RoomType } from '../../../../../graphql/generated-types';


export interface FormikRoomTypeFieldProps extends Pick<RoomTypeFieldProps, 'id' | 'label' | 'disabled' | 'helperText' | 'autoFocus'> {
    name: string;
    optional?: boolean;
}

export function FormikRoomTypeField({ name, label, optional, ...rest }: FormikRoomTypeFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { onChange, ...field }, meta ] = useField<RoomType | null>(name);
    const errorMessage = meta.touched ? meta.error : undefined;

    const handleChange = React.useCallback((value: RoomType | null) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    const fieldLabel = React.useMemo(() => (
        optional ? <LabelWithOptionalIndicator label={label} /> : label
    ), [ label, optional ]);

    return (
        <RoomTypeField
            {...field}
            {...rest}
            onChange={handleChange}

            id={rest.id || field.name}
            label={fieldLabel}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}
        />
    );
}
