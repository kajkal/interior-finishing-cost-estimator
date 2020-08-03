import React from 'react';
import { useField, useFormikContext } from 'formik';
import { SlateDocument } from '@udecode/slate-plugins';

import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { RichTextEditor } from './RichTextEditor';


export interface FormikRichTextEditorProps {
    name: string;
    label: string;
    optional?: boolean;
    autoFocus?: boolean;
}

export function FormikRichTextEditor({ name, label, optional, autoFocus }: FormikRichTextEditorProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ { value }, meta, { setValue, setTouched } ] = useField<SlateDocument>(name);

    const handleTouched = () => {
        setTouched(true);
    };

    return (
        <RichTextEditor
            name={name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            error={meta.touched ? meta.error : undefined}
            disabled={isSubmitting}
            value={value}
            onChange={setValue}
            onTouched={handleTouched}
            autoFocus={autoFocus}
        />
    );
}
