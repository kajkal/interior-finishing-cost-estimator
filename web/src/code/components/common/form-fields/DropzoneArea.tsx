import React from 'react';
import clsx from 'clsx';
import { DropzoneOptions, useDropzone } from 'react-dropzone';

import { makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';

import { ThemeType } from '../../../utils/theme/ThemeUtils';


export interface DropzoneAreaProps extends DropzoneOptions {
    name: string;
    label: string;
    error?: string;
    disabled?: boolean;
    files: File[];
    onDelete: (file: File) => void;
    onTouched: () => void;
}

export function DropzoneArea({ name, label, error, files, onDelete, onTouched, ...dropzoneOptions }: DropzoneAreaProps): React.ReactElement {
    const classes = useStyles();
    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, isFileDialogActive } = useDropzone(dropzoneOptions);
    const labelId = 'dropzone-label';
    const helperTextId = error ? 'dropzone-helper-text' : undefined;

    return (
        <FormControl fullWidth margin='normal'>
            <div
                {...getRootProps()}
                onBlur={isFileDialogActive ? undefined : onTouched}
                role='button'
                aria-invalid={Boolean(error)}
                aria-disabled={dropzoneOptions.disabled || undefined}
                aria-labelledby={labelId}
                aria-describedby={helperTextId}
                className={clsx(classes.dropzone, {
                    [ classes.dragActive ]: isDragActive,
                    [ classes.dragAccept ]: isDragAccept,
                    [ classes.dragReject ]: isDragReject,
                })}
            >
                <div className={classes.dropzoneArea}>

                    <input {...getInputProps({ name })} />

                    <label id={labelId} className={classes.label}>
                        {label}
                    </label>

                    <div className={classes.files}>
                        {
                            files.map((file, index) => (
                                <Chip
                                    key={index + file.name}
                                    className={classes.fileChip}
                                    label={file.name}
                                    variant='outlined'
                                    onDelete={() => onDelete(file)}
                                    disabled={dropzoneOptions.disabled}
                                />
                            ))
                        }
                    </div>

                </div>
            </div>
            {
                error && (
                    <FormHelperText id={helperTextId} error variant='filled'>
                        {error}
                    </FormHelperText>
                )
            }
        </FormControl>
    );
}

const useStyles = makeStyles((theme) => ({
    '@keyframes activeEffect': {
        from: {
            backgroundPositionY: 0,
        },
        to: {
            backgroundPositionY: 24,
        },
    },
    dropzone: {
        outline: 'none',
        border: '1px solid transparent',
        borderRadius: theme.shape.borderRadius,
        backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="${theme.palette.background.paper.replace('#', '%23')}" width="24px" height="24px" xmlns="http://www.w3.org/2000/svg"><path d="M0 6l6-6h12L0 18zM24 18l-6 6H6L24 6z"/></svg>')`,
        backgroundColor: theme.palette.text.disabled,
        transition: theme.transitions.create('background-color'),
        '&:hover': {
            backgroundColor: theme.palette.text.primary,
        },
        '&:focus, &:active': {
            backgroundColor: theme.palette.primary.main,
        },
        '&[aria-disabled=true]': {
            backgroundColor: `${theme.palette.text.disabled}`,
            '& $dropzoneArea': {
                backgroundColor: (theme.palette.type === ThemeType.light) ? 'rgba(255, 255, 255,0.4)' : 'rgba(0, 0, 0, 0.4)',
            },
        },
        '&$dragActive': {
            animation: `$activeEffect 0.5s linear infinite`,
        },
        '&$dragAccept': {
            backgroundColor: theme.palette.success.main,
        },
        '&$dragReject': {
            backgroundColor: theme.palette.error.main,
        },
    },
    dropzoneArea: {
        minHeight: 168,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
    },
    dragActive: {},
    dragAccept: {},
    dragReject: {},
    label: {
        padding: '27px 12px 10px',
        textAlign: 'center',
        display: 'block',
        color: theme.palette.text.secondary,
        ...theme.typography.body1,
    },
    files: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: theme.spacing(1),
    },
    fileChip: {
        margin: theme.spacing(0.5),
    },
}));
