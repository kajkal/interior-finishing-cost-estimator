import React from 'react';
import { Transforms } from 'slate';
import { TodoListElementProps } from '@udecode/slate-plugins';
import { ReactEditor, useEditor, useReadOnly } from 'slate-react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';


export function TodoListElement({ attributes, element, children }: TodoListElementProps): React.ReactElement {
    const classes = useStyles();
    const editor = useEditor();
    const readOnly = useReadOnly();

    return (
        <div {...attributes} className={classes.root}>
            <Checkbox
                className={classes.checkbox}
                contentEditable={false}
                checked={Boolean(element.checked)}
                onChange={({ target: { checked } }) => {
                    const path = ReactEditor.findPath(editor, element);
                    Transforms.setNodes(editor, { checked }, { at: path });
                }}
                disabled={readOnly}
                classes={{
                    disabled: classes.disabled,
                    checked: classes.checked,
                }}
                size='small'
                color='primary'
            />
            <Typography
                variant='body2'
                className={classes.text}
                contentEditable={!readOnly}
                suppressContentEditableWarning
            >
                {children}
            </Typography>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    checkbox: {
        alignSelf: 'flex-start',
        padding: theme.spacing(0.5),
        '&$disabled': {
            color: theme.palette.text.secondary,
            '&$checked': {
                color: theme.palette.primary.main,
            },
        },
    },
    disabled: {},
    checked: {},
    text: {
        marginTop: theme.spacing(0.5),
    },
}));
