import { ReactEditor } from 'slate-react';
import { Transforms } from 'slate';


let isFocusedSpy: jest.SpiedFunction<typeof ReactEditor.isFocused>;

beforeEach(() => {
    isFocusedSpy?.mockRestore();
    isFocusedSpy = jest.spyOn(ReactEditor, 'isFocused');
});

/**
 * Every other way to manipulate slate editor failed (custom beforeinput events, paste events).
 * Expect only one editor in DOM.
 */
function typeInEditor(text: string) {
    expect(isFocusedSpy).toHaveBeenCalled();
    const editor = isFocusedSpy.mock.calls[ 0 ][ 0 ];
    Transforms.select(editor, {
        anchor: { path: [ 0, 0, 0 ], offset: 0 },
        focus: { path: [ 0, 0, 0 ], offset: 0 },
    });
    Transforms.insertText(editor, text);
}

export default {
    typeInEditor,
};
