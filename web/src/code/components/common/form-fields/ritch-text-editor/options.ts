import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { BoldPlugin, DEFAULTS_BOLD, DEFAULTS_IMAGE, DEFAULTS_ITALIC, DEFAULTS_LIST, DEFAULTS_STRIKETHROUGH, DEFAULTS_SUBSUPSCRIPT, DEFAULTS_UNDERLINE, ELEMENT_H1, ELEMENT_H2, ELEMENT_PARAGRAPH, ELEMENT_TODO_LI, ExitBreakPlugin, HeadingPlugin, ImagePlugin, isBlockAboveEmpty, isSelectionAtBlockStart, ItalicPlugin, LinkPlugin, ListPlugin, ParagraphPlugin, ResetBlockTypePlugin, SlateDocument, SlatePlugin, SoftBreakPlugin, StrikethroughPlugin, SubscriptPlugin, SuperscriptPlugin, TodoListPlugin, UnderlinePlugin, withDeserializeHTML, withImageUpload, withInlineVoid, withLink, withToggleType, withTrailingNode, withTransforms } from '@udecode/slate-plugins';

import { ParagraphElement } from './elements/ParagraphElement';
import { SubtitleElement } from './elements/SubtitleElement';
import { TodoListElement } from './elements/TodoListElement';
import { TitleElement } from './elements/TitleElement';
import { LinkElement } from './elements/LinkElement';


export const options = {
    paragraph: {
        p: { component: ParagraphElement },
    },
    heading: {
        h1: { component: TitleElement },
        h2: { component: SubtitleElement },
    },
    bold: DEFAULTS_BOLD,
    italic: DEFAULTS_ITALIC,
    underline: DEFAULTS_UNDERLINE,
    strikethrough: DEFAULTS_STRIKETHROUGH,
    subSuperscript: DEFAULTS_SUBSUPSCRIPT,
    list: DEFAULTS_LIST,
    todoList: {
        todo_li: { component: TodoListElement },
    },
    link: {
        link: { component: LinkElement },
    },
    image: DEFAULTS_IMAGE,
};

export const plugins: SlatePlugin[] = [
    ParagraphPlugin(options.paragraph),
    HeadingPlugin(options.heading),
    BoldPlugin(options.bold),
    ItalicPlugin(options.italic),
    UnderlinePlugin(options.underline),
    StrikethroughPlugin(options.strikethrough),
    SubscriptPlugin(options.subSuperscript),
    SuperscriptPlugin(options.subSuperscript),
    ListPlugin(options.list),
    TodoListPlugin(options.todoList),
    LinkPlugin(options.link),
    ImagePlugin(options.image),
    ResetBlockTypePlugin({
        rules: [
            {
                hotkey: 'Enter',
                predicate: isBlockAboveEmpty,
                defaultType: ELEMENT_PARAGRAPH,
                types: [ ELEMENT_TODO_LI ],
            },
            {
                hotkey: 'Backspace',
                predicate: isSelectionAtBlockStart,
                defaultType: ELEMENT_PARAGRAPH,
                types: [ ELEMENT_TODO_LI ],
            },
        ],
    }),
    SoftBreakPlugin({
        rules: [
            {
                hotkey: 'shift+enter',
            },
        ],
    }),
    ExitBreakPlugin({
        rules: [
            {
                hotkey: 'mod+enter',
            },
            {
                hotkey: 'enter',
                query: {
                    end: true,
                    allow: [ ELEMENT_H1, ELEMENT_H2 ],
                },
            },
        ],
    }),
];

export const withPlugins = [
    withReact,
    withHistory,
    withLink(),
    withImageUpload(),
    withToggleType({ defaultType: ELEMENT_PARAGRAPH }),
    withTransforms(),
    withTrailingNode({ type: ELEMENT_PARAGRAPH }),
    withInlineVoid({ plugins }),
    withDeserializeHTML({ plugins }),
] as const;

export const emptyEditorValue: SlateDocument = [
    {
        children: [
            { type: ELEMENT_PARAGRAPH, children: [ { text: '' } ] },
        ],
    },
];
