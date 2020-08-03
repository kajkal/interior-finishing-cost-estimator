import React from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ReactEditor, useSlate } from 'slate-react';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_OL, ELEMENT_TODO_LI, ELEMENT_UL, getPreventDefaultHandler, isNodeTypeIn, ListPluginOptions, toggleList, ToggleTypeEditor } from '@udecode/slate-plugins';

import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LooksOneIcon from '@material-ui/icons/LooksOne';
import LooksTwoIcon from '@material-ui/icons/LooksTwo';
import CheckIcon from '@material-ui/icons/Check';

import { ToolbarButton } from '../toolbar/ToolbarButton';


export type BasicBlockType = 'title' | 'subtitle' | 'todo';
export type ListBlockType = 'bulleted' | 'numbered';
export type BlockType = BasicBlockType | ListBlockType;

export interface BasicBlockButtonProps {
    type: BasicBlockType;
    options?: never;
    disabled?: boolean;
}

export interface ListBlockButtonProps {
    type: ListBlockType;
    options: ListPluginOptions;
    disabled?: boolean;
}

export type BlockButtonProps = BasicBlockButtonProps | ListBlockButtonProps;

export function BlockButton({ type, options, disabled }: BlockButtonProps): React.ReactElement {
    const { t } = useTranslation();
    const editor = useSlate() as ReactEditor & ToggleTypeEditor;
    const { blockType, Icon, label } = getBlockConfig(type, t);

    return (
        <ToolbarButton
            active={isNodeTypeIn(editor, blockType)}
            label={label}
            onMouseDown={
                ([ 'bulleted', 'numbered' ].includes(type))
                    ? getPreventDefaultHandler(toggleList, editor, { typeList: blockType, ...options })
                    : getPreventDefaultHandler(editor.toggleType, blockType)
            }
            disabled={disabled}
        >
            <Icon />
        </ToolbarButton>
    );
}

function getBlockConfig(type: BlockType, t: TFunction) {
    switch (type) {
        case 'title':
            return {
                blockType: ELEMENT_H1,
                Icon: LooksOneIcon,
                label: t('form.editor.toolbar.title'),
            };
        case 'subtitle':
            return {
                blockType: ELEMENT_H2,
                Icon: LooksTwoIcon,
                label: t('form.editor.toolbar.subtitle'),
            };
        case 'todo':
            return {
                blockType: ELEMENT_TODO_LI,
                Icon: CheckIcon,
                label: t('form.editor.toolbar.todoList'),
            };
        case 'bulleted':
            return {
                blockType: ELEMENT_UL,
                Icon: FormatListBulletedIcon,
                label: t('form.editor.toolbar.bulletedList'),
            };
        case 'numbered':
            return {
                blockType: ELEMENT_OL,
                Icon: FormatListNumberedIcon,
                label: t('form.editor.toolbar.numberedList'),
            };
    }
}

