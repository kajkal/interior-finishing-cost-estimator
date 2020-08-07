import React from 'react';
import { TFunction } from 'i18next';
import { useSlate } from 'slate-react';
import { useTranslation } from 'react-i18next';
import { History, HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react/dist/plugin/react-editor';

import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';

import { ToolbarButton, ToolbarButtonProps } from '../toolbar/ToolbarButton';


export type HistoryButtonType = 'undo' | 'redo';

export interface HistoryButtonProps {
    type: HistoryButtonType;
    disabled?: boolean;
    onCall?: () => void;
}

export function HistoryButton({ type, disabled, onCall }: HistoryButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const editor = useSlate() as ReactEditor & HistoryEditor;
    const { Icon, label, shortcut, historyKey } = getHistoryButtonConfig(type, t);
    const isActionAvailable = editor.history[ historyKey ].every((operations) => (
        operations.every(({ type }) => type === 'set_selection')
    ));

    const handleMouseDown: ToolbarButtonProps['onMouseDown'] = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editor[ type ]();
        onCall && onCall();
    };

    return (
        <ToolbarButton
            label={label}
            shortcut={shortcut}
            onMouseDown={handleMouseDown}
            disabled={isActionAvailable || disabled}
        >
            <Icon />
        </ToolbarButton>
    );
}

function getHistoryButtonConfig(type: HistoryButtonType, t: TFunction) {
    switch (type) {
        case 'undo':
            return {
                Icon: UndoIcon,
                label: t('form.common.editor.toolbar.undo'),
                shortcut: 'Ctrl+Z',
                historyKey: 'undos' as keyof History,
            };
        case 'redo':
            return {
                Icon: RedoIcon,
                label: t('form.common.editor.toolbar.redo'),
                shortcut: 'Ctrl+Shift+Z',
                historyKey: 'redos' as keyof History,
            };
    }
}
