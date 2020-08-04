import React from 'react';
import { FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useField, useFormikContext } from 'formik';

import { DropzoneArea } from './DropzoneArea';


export interface FormikDropzoneAreaProps {
    name: string;
    label: string;
    accept?: string;
    multiple?: boolean; // default to false
    autoFocus?: boolean;
}

const maxSizeInB = 1e+8; // 100mb

export function FormikDropzoneArea({ name, label, accept, multiple = false, autoFocus }: FormikDropzoneAreaProps): React.ReactElement {
    const { t } = useTranslation();
    const { isSubmitting } = useFormikContext();
    const [ { value }, meta, { setValue, setTouched, setError } ] = useField<File | File[] | null>(name);

    const handleDelete = (file: File) => {
        setValue(Array.isArray(value) ? value.filter((f) => f !== file) : null);
    };

    const handleTouched = () => {
        setTouched(true);
    };

    const handleAcceptedDrop = (files: File[]) => {
        setTouched(true, false);
        setValue(multiple ? files : files[ 0 ]);
    };

    const handleRejectedDrop = ([ fileRejection ]: FileRejection[]) => {
        setTouched(true, false);
        setError(translateError(fileRejection) as any);
    };

    const translateError = ({ file: { name }, errors: [ error ] }: FileRejection) => {
        switch (error.code) {
            case 'file-invalid-type':
                return t('form.common.dropzone.validation.invalidType');
            case 'file-too-large':
                return t('form.common.dropzone.validation.tooLarge', { filename: name, maxSizeInMb: maxSizeInB / 1e+6 });
            case 'too-many-files':
                return t('form.common.dropzone.validation.toManyFiles');
            default:
                return t('form.common.dropzone.validation.unknownError', { filename: name });
        }
    };

    return (
        <DropzoneArea
            name={name}
            label={label}
            error={meta.touched ? meta.error : undefined}
            disabled={isSubmitting}
            files={Array.isArray(value) ? value : (value ? [ value ] : [])}
            maxSize={maxSizeInB}
            accept={accept}
            multiple={multiple}
            onDropAccepted={handleAcceptedDrop}
            onDropRejected={handleRejectedDrop}
            onFileDialogCancel={handleTouched}
            onTouched={handleTouched}
            onDelete={handleDelete}
            autoFocus={autoFocus}
        />
    );
}
