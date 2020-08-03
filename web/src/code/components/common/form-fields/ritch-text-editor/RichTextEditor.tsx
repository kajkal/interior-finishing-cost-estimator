import React from 'react';
import clsx from 'clsx';
import { Slate } from 'slate-react';
import { createEditor, Node } from 'slate';
import { useTranslation } from 'react-i18next';
import { EditablePlugins, pipe, SlateDocument } from '@udecode/slate-plugins';

import { makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';

import { InsertLinkButton } from './toolbar-buttons/InsertLinkButton';
import { InsertImageButton } from './toolbar-buttons/InsertImageButton';
import { HistoryButton } from './toolbar-buttons/HistoryButton';
import { ThemeType } from '../../../../utils/theme/ThemeUtils';
import { BlockButton } from './toolbar-buttons/BlockButton';
import { MarkButton } from './toolbar-buttons/MarkButton';
import { options, plugins, withPlugins } from './options';
import { ToolbarButtonGroup } from './toolbar/ToolbarButtonGroup';
import { Toolbar } from './toolbar/Toolbar';


export interface RichTextEditorProps {
    name: string;
    label: React.ReactNode;
    error?: string;
    disabled?: boolean;
    value: SlateDocument;
    onChange: (value: SlateDocument) => void;
    onTouched?: () => void;
    autoFocus?: boolean;
    classes?: {
        toolbar?: string;
    };
}

export function RichTextEditor({ name, label, error, disabled, value, onChange, onTouched, autoFocus, ...rest }: RichTextEditorProps): React.ReactElement {
    const classes = useStyles();
    const { t } = useTranslation();
    const editor = React.useMemo(() => pipe(createEditor(), ...withPlugins), []);
    const helperTextId = error ? 'editor-helper-text' : undefined;

    return (
        <FormControl fullWidth margin='normal'>
            <Paper
                elevation={0}
                className={clsx(classes.editor, {
                    [ classes.disabled ]: disabled,
                })}
            >
                <Slate
                    editor={editor}
                    value={value}
                    onChange={onChange as (value: Node[]) => void}
                >

                    <Toolbar className={rest.classes?.toolbar}>

                        <ToolbarButtonGroup aria-label={t('form.editor.toolbar.historyControls')}>
                            <HistoryButton type='undo' disabled={disabled} />
                            <HistoryButton type='redo' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.editor.toolbar.headerControls')}>
                            <BlockButton type='title' disabled={disabled} />
                            <BlockButton type='subtitle' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.editor.toolbar.markControls')}>
                            <MarkButton type='bold' disabled={disabled} />
                            <MarkButton type='italic' disabled={disabled} />
                            <MarkButton type='underline' disabled={disabled} />
                            <MarkButton type='superscript' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.editor.toolbar.listControls')}>
                            <BlockButton type='bulleted' options={options.list} disabled={disabled} />
                            <BlockButton type='numbered' options={options.list} disabled={disabled} />
                            <BlockButton type='todo' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.editor.toolbar.attachmentControls')}>
                            <InsertLinkButton options={options.link} disabled={disabled} />
                            <InsertImageButton options={options.image} disabled={disabled} />
                        </ToolbarButtonGroup>

                    </Toolbar>

                    <EditablePlugins
                        name={name}
                        placeholder={label as unknown as string}
                        readOnly={disabled}
                        autoFocus={autoFocus}
                        onBlur={onTouched}
                        aria-label={t('form.editor.ariaLabel')}
                        aria-invalid={Boolean(error)}
                        aria-describedby={helperTextId}
                        aria-disabled={disabled || undefined}
                        className={clsx(classes.editorArea)}
                        style={{}} // override redundant styles
                        plugins={plugins}
                        spellCheck
                    />

                </Slate>
            </Paper>
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
    divider: {
        margin: theme.spacing(1, 0.5),
        backgroundColor: theme.palette.text.disabled,
    },
    editor: {
        border: `1px solid ${theme.palette.text.disabled}`,
        '&$disabled': {
            backgroundColor: (theme.palette.type === ThemeType.light) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
        },
        '&:hover': {
            borderColor: theme.palette.text.primary,
        },
        '&:focus-within': {
            borderColor: theme.palette.primary.main,
        },
    },
    disabled: {},
    editorArea: {
        padding: '10px 12px',
    },
}));
