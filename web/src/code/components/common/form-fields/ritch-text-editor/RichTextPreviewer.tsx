import React from 'react';
import { Slate, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { EditablePlugins, pipe, SlateDocument } from '@udecode/slate-plugins';

import { plugins } from './options';


export interface RichTextPreviewerProps {
    value: SlateDocument;
}

export function RichTextPreviewer({ value }: RichTextPreviewerProps): React.ReactElement {
    const editor = React.useMemo(() => pipe(createEditor(), withReact), []);
    return (
        <Slate editor={editor} value={value} onChange={noop}>
            <EditablePlugins
                readOnly
                style={{}} // override redundant styles
                plugins={plugins}
            />
        </Slate>
    );
}

const noop = () => null!;
