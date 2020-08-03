import React from 'react';
import { TFunction } from 'i18next';
import { useSlate } from 'slate-react';
import { useTranslation } from 'react-i18next';
import { getPreventDefaultHandler, isMarkActive, MARK_BOLD, MARK_ITALIC, MARK_SUBSCRIPT, MARK_SUPERSCRIPT, MARK_UNDERLINE, toggleMark } from '@udecode/slate-plugins';

import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatBoldIcon from '@material-ui/icons/FormatBold';

import { SuperscriptIcon } from '../../../icons/SuperscriptIcon';
import { ToolbarButton } from '../toolbar/ToolbarButton';


export type MarkType = 'bold' | 'italic' | 'underline' | 'superscript';

export interface MarkButtonProps {
    type: MarkType;
    disabled?: boolean;
}

export function MarkButton({ type, disabled }: MarkButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const { markType, clear, Icon, label, shortcut } = getMarkConfig(type, t);
    const editor = useSlate();

    return (
        <ToolbarButton
            active={isMarkActive(editor, markType)}
            label={label}
            shortcut={shortcut}
            onMouseDown={getPreventDefaultHandler(toggleMark, editor, type, clear)}
            disabled={disabled}
        >
            <Icon />
        </ToolbarButton>
    );
}

function getMarkConfig(type: MarkType, t: TFunction) {
    switch (type) {
        case 'bold':
            return {
                markType: MARK_BOLD,
                Icon: FormatBoldIcon,
                label: t('form.editor.toolbar.bold'),
                shortcut: 'Ctrl+B',
            };
        case 'italic':
            return {
                markType: MARK_ITALIC,
                Icon: FormatItalicIcon,
                label: t('form.editor.toolbar.italic'),
                shortcut: 'Ctrl+I',
            };
        case 'underline':
            return {
                markType: MARK_UNDERLINE,
                Icon: FormatUnderlinedIcon,
                label: t('form.editor.toolbar.underline'),
                shortcut: 'Ctrl+U',
            };
        case 'superscript':
            return {
                markType: MARK_SUPERSCRIPT,
                clear: MARK_SUBSCRIPT,
                Icon: SuperscriptIcon,
                label: t('form.editor.toolbar.superscript'),
                shortcut: 'Ctrl+.',
            };
    }
}
