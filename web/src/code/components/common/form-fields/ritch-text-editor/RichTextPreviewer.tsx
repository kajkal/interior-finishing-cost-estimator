import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { EditablePlugins, pipe, SlateDocument } from '@udecode/slate-plugins';

import { plugins } from './options';


export interface RichTextPreviewerProps {
    value: string;
}

export function RichTextPreviewer({ value }: RichTextPreviewerProps): React.ReactElement {
    const editor = React.useMemo(() => pipe(createEditor(), withReact), []);
    const parsedValue = React.useMemo<SlateDocument>(() => JSON.parse(value), [ value ]);

    return (
        <Slate editor={editor} value={parsedValue} onChange={noop}>
            <EditablePlugins
                readOnly
                style={{}} // override redundant styles
                plugins={plugins}
            />
        </Slate>
    );
}

const noop = () => null!;
