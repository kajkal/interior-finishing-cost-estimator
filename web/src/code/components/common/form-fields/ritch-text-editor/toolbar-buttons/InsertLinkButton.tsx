import React from 'react';
import { useSlate } from 'slate-react';
import { useTranslation } from 'react-i18next';
import { ELEMENT_LINK, getNodesByType, isNodeTypeIn, LinkNode, LinkPluginOptions, upsertLinkAtSelection } from '@udecode/slate-plugins';

import InsertLinkIcon from '@material-ui/icons/InsertLink';

import { ToolbarButton, ToolbarButtonProps } from '../toolbar/ToolbarButton';


export interface InsertLinkButtonProps {
    options: LinkPluginOptions;
    disabled?: boolean;
}

export function InsertLinkButton({ options, disabled }: InsertLinkButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const editor = useSlate();

    const handleMouseDown: ToolbarButtonProps['onMouseDown'] = (event) => {
        event.preventDefault();

        const [ match ] = getNodesByType(editor, ELEMENT_LINK);
        const existingLinkNode = match?.[ 0 ] as unknown as LinkNode | undefined;

        const url = window.prompt(t('form.editor.toolbar.insertLinkPrompt'), existingLinkNode?.url);
        if (url) {
            upsertLinkAtSelection(editor, url, options);
        }
    };

    return (
        <ToolbarButton
            active={isNodeTypeIn(editor, ELEMENT_LINK)}
            label={t('form.editor.toolbar.insertLink')}
            onMouseDown={handleMouseDown}
            disabled={disabled}
        >
            <InsertLinkIcon />
        </ToolbarButton>
    );
}
