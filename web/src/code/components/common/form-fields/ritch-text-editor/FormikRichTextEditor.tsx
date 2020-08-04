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
    const [ field, meta, { setValue, setTouched } ] = useField<SlateDocument>(name);

    const handleTouched = () => {
        setTouched(true);
    };

    return (
        <RichTextEditor
            id={rest.id || field.name}
            name={name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            error={meta.touched ? meta.error : undefined}
            disabled={isSubmitting}
            value={field.value}
            onChange={setValue}
            onBlur={handleTouched}
            {...rest}
        />
    );
}
