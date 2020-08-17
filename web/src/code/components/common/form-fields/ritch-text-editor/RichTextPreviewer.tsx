import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { EditablePlugins, pipe, SlateDocument, withInlineVoid } from '@udecode/slate-plugins';

import { plugins } from './options';


export interface RichTextPreviewerProps {
    value: string;
    className?: string;
}

export function RichTextPreviewer({ value, className }: RichTextPreviewerProps): React.ReactElement {
    const editor = React.useMemo(() => pipe(createEditor(), withReact, withInlineVoid({ plugins })), []);
    const parsedValue = React.useMemo<SlateDocument>(() => JSON.parse(value), [ value ]);

    return (
        <Slate editor={editor} value={parsedValue} onChange={noop}>
            <EditablePlugins
                readOnly
                style={{}} // override redundant styles
                plugins={plugins}
                className={className}
            />
        </Slate>
    );
}

const noop = () => null!;
