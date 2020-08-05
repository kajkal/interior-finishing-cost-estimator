import React from 'react';
import { useField, useFormikContext } from 'formik';

import { LabelWithOptionalIndicator } from '../LabelWithOptionalIndicator';
import { TagOption, TagsField, TagsFieldProps } from './TagsField';


export interface FormikTagsFieldProps extends Pick<TagsFieldProps, 'id' | 'label' | 'definedTagOptions' | 'disabled' | 'helperText'> {
    name: string;
    optional?: boolean;
}

export function FormikTagsField({ name, label, optional, definedTagOptions, ...rest }: FormikTagsFieldProps): React.ReactElement {
    const { isSubmitting } = useFormikContext();
    const [ field, meta, { setValue } ] = useField<TagOption[]>(name);
    const errorMessage = meta.touched ? parseTagsError(meta.error) : undefined;

    return (
        <TagsField
            {...field}
            {...rest}
            onChange={setValue}

            definedTagOptions={definedTagOptions}

            id={rest.id || field.name}
            label={optional ? <LabelWithOptionalIndicator label={label} /> : label}
            disabled={rest.disabled || isSubmitting}
            error={Boolean(errorMessage)}
            helperText={errorMessage || rest.helperText}
        />
    );
}

type TagError = Partial<Record<keyof TagOption, string>>;

function parseTagsError(errors?: (TagError | string)[] | string | undefined): string | undefined {
    if (errors) return (typeof errors === 'string') ? errors : errors.map(parseTagError).find(Boolean);
}

function parseTagError(error: TagError | string | undefined): string | undefined {
    if (error) return (typeof error === 'string') ? error : error.name;
}
