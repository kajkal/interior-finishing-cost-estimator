import React from 'react';
import clsx from 'clsx';
import { Slate } from 'slate-react';
import { createEditor, Node } from 'slate';
import { useTranslation } from 'react-i18next';
import { EditablePlugins, pipe, SlateDocument } from '@udecode/slate-plugins';

import { makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';

import { isSlateDocumentNotEmpty } from '../../../../utils/validation/richTestEditorSchema';
import { InsertImageButton } from './toolbar-buttons/InsertImageButton';
import { InsertLinkButton } from './toolbar-buttons/InsertLinkButton';
import { ToolbarButtonGroup } from './toolbar/ToolbarButtonGroup';
import { HistoryButton } from './toolbar-buttons/HistoryButton';
import { ThemeType } from '../../../../utils/theme/ThemeUtils';
import { BlockButton } from './toolbar-buttons/BlockButton';
import { MarkButton } from './toolbar-buttons/MarkButton';
import { options, plugins, withPlugins } from './options';
import { Toolbar } from './toolbar/Toolbar';


export interface RichTextEditorProps {
    id?: string;
    name: string;
    label: React.ReactNode;
    'aria-label'?: string;
    error?: string;
    disabled?: boolean;
    value: SlateDocument;
    onChange: (value: SlateDocument) => void;
    onBlur?: () => void;
    autoFocus?: boolean;
}

export const RichTextEditor = React.memo(
    function RichTextEditor({ id, name, label, error, disabled, value, onChange, 'aria-label': ariaLabel, ...rest }: RichTextEditorProps): React.ReactElement {
        const classes = useStyles();
        const { t } = useTranslation();
        const editor = React.useMemo(() => pipe(createEditor(), ...withPlugins), []);
        const [ editorRef, focused ] = useMakeshiftEditorFocusDetector(rest.autoFocus);
        const helperTextId = error ? 'editor-helper-text' : undefined;

        return (
            <Slate
                editor={editor}
                value={value}
                onChange={onChange as (value: Node[]) => void}
            >
                <FormControl fullWidth margin='normal' aria-label={ariaLabel}>

                    <Toolbar>

                        <ToolbarButtonGroup aria-label={t('form.common.editor.toolbar.historyControls')}>
                            <HistoryButton type='undo' disabled={disabled} />
                            <HistoryButton type='redo' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.common.editor.toolbar.headerControls')}>
                            <BlockButton type='title' disabled={disabled} />
                            <BlockButton type='subtitle' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.common.editor.toolbar.markControls')}>
                            <MarkButton type='bold' disabled={disabled} />
                            <MarkButton type='italic' disabled={disabled} />
                            <MarkButton type='underline' disabled={disabled} />
                            <MarkButton type='superscript' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.common.editor.toolbar.listControls')}>
                            <BlockButton type='bulleted' options={options.list} disabled={disabled} />
                            <BlockButton type='numbered' options={options.list} disabled={disabled} />
                            <BlockButton type='todo' disabled={disabled} />
                        </ToolbarButtonGroup>

                        <Divider className={classes.divider} flexItem orientation='vertical' />

                        <ToolbarButtonGroup aria-label={t('form.common.editor.toolbar.attachmentControls')}>
                            <InsertLinkButton options={options.link} disabled={disabled} />
                            <InsertImageButton options={options.image} disabled={disabled} />
                        </ToolbarButtonGroup>

                    </Toolbar>

                    <Paper
                        ref={editorRef}
                        elevation={0}
                        className={clsx(classes.editor, {
                            [ classes.disabled ]: disabled,
                            [ classes.focused ]: focused,
                        })}
                    >

                        <InputLabel
                            focused={focused}
                            shrink={focused || isSlateDocumentNotEmpty(value)}
                            variant='filled'
                            htmlFor={id}
                        >
                            {label}
                        </InputLabel>

                        <EditablePlugins
                            {...rest}
                            id={id}
                            name={name}
                            readOnly={disabled}
                            aria-invalid={Boolean(error)}
                            aria-describedby={helperTextId}
                            aria-disabled={disabled || undefined}
                            data-testid='slate-editor'
                            className={classes.editorArea}
                            style={{}} // override redundant styles
                            plugins={plugins}
                            spellCheck
                        />

                    </Paper>

                    {
                        error && (
                            <FormHelperText id={helperTextId} error variant='filled'>
                                {error}
                            </FormHelperText>
                        )
                    }

                </FormControl>
            </Slate>
        );
    },
);

/**
 * {ReactEditor.isFocused(editor)} could tell if editor is focused only at the time of the render.
 * Code bellow tries to fix this.
 */
function useMakeshiftEditorFocusDetector(autoFocus?: boolean): [ React.RefObject<HTMLDivElement>, boolean ] {
    const editorRef = React.useRef<HTMLDivElement>(null);
    const [ focused, setFocused ] = React.useState(Boolean(autoFocus));

    React.useEffect(() => {
        let timeoutId: number;

        function handleFocusIn({ target }: FocusEvent) {
            const isFocusWithinEditor = (target instanceof HTMLElement) && editorRef.current?.contains(target);
            timeoutId = window.setTimeout(() => setFocused(Boolean(isFocusWithinEditor)), 5); // otherwise editor loses cursor
        }

        document.addEventListener('focusin', handleFocusIn);
        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            clearTimeout(timeoutId);
        };
    }, [ editorRef, setFocused ]);

    return [ editorRef, focused ];
}

const useStyles = makeStyles((theme) => ({
    divider: {
        margin: theme.spacing(1, 0.5),
        backgroundColor: theme.palette.text.disabled,
    },
    editor: {
        position: 'relative',
        border: `1px solid ${theme.palette.text.disabled}`,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        transition: theme.transitions.create([ 'border-color' ]),
        '&:hover': {
            borderColor: theme.palette.text.primary,
        },
        '&$focused': {
            borderColor: theme.palette.primary.main,
        },
        '&$disabled': {
            backgroundColor: (theme.palette.type === ThemeType.light) ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
        },
    },
    disabled: {},
    focused: {},
    editorArea: {
        padding: '27px 12px 10px',
        minHeight: 100,
    },
}));
