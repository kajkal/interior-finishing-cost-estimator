import React from 'react';
import { useField, useFormikContext } from 'formik';
import { SlateDocument } from '@udecode/slate-plugins';

import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { RichTextEditor, RichTextEditorProps } from './RichTextEditor';


export interface FormikRichTextEditorProps extends Pick<RichTextEditorProps, 'id' | 'autoFocus' | 'aria-label'> {
    name: string;
    label: string;
    optional?: boolean;
}

export function FormikRichTextEditor({ name, label, optional, ...rest }: FormikRichTextEditorProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { value, onChange, onBlur }, meta ] = useField<SlateDocument>(name);

    /**
     * {setValue} from FiledHelpers changes on every render, {onChange} from FieldInput not.
     */
    const handleChange = React.useCallback((value: SlateDocument) => {
        onChange({ target: { name: name, value } });
    }, [ name, onChange ]);

    /**
     * {setTouched} from FiledHelpers changes on every render, {onBlur} from FieldInput not.
     */
    const handleTouched = React.useCallback(() => {
        onBlur({ target: { name: name } });
    }, [ name, onBlur ]);

    const fieldLabel = React.useMemo(() => (
        optional ? <LabelWithOptionalIndicator label={label} /> : label
    ), [ label, optional ]);

    return (
        <RichTextEditor
            id={rest.id || name}
            name={name}
            label={fieldLabel}
            error={meta.touched ? meta.error : undefined}
            disabled={isSubmitting}
            value={value}
            onChange={handleChange}
            onBlur={handleTouched}
            {...rest}
        />
    );
}
