import React from 'react';
import { useSlate } from 'slate-react';
import { useTranslation } from 'react-i18next';
import { ELEMENT_IMAGE, getNodesByType, ImageNode, ImagePluginOptions, insertImage } from '@udecode/slate-plugins';

import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';

import { ToolbarButton, ToolbarButtonProps } from '../toolbar/ToolbarButton';


export interface InsertImageButtonProps {
    options: ImagePluginOptions;
    disabled?: boolean;
}

export function InsertImageButton({ options, disabled }: InsertImageButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const editor = useSlate();

    const handleMouseDown: ToolbarButtonProps['onMouseDown'] = (event) => {
        event.preventDefault();

        const [ match ] = getNodesByType(editor, ELEMENT_IMAGE);
        const existingSelectedImageNode = match?.[ 0 ] as unknown as ImageNode | undefined;

        const url = window.prompt(t('form.editor.toolbar.insertImagePrompt'), existingSelectedImageNode?.url);
        if (url) {
            insertImage(editor, url, { img: options.img });
        }
    };

    return (
        <ToolbarButton
            label={t('form.editor.toolbar.insertImage')}
            onMouseDown={handleMouseDown}
            disabled={disabled}
        >
            <InsertPhotoIcon />
        </ToolbarButton>
    );
}
