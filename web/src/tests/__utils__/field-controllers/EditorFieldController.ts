import { Node, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { fireEvent } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { flushPromises } from '../extendedUserEvent';


let isFocusedSpy: jest.SpiedFunction<typeof ReactEditor.isFocused>;

beforeEach(() => {
    isFocusedSpy?.mockRestore();
    isFocusedSpy = jest.spyOn(ReactEditor, 'isFocused');
});

export class EditorFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): EditorFieldController {
        return this.resolve(inputElement) as EditorFieldController;
    }

    typeInEditor(text: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            fireEvent.focus(inputElement);

            /**
             * Every other way to manipulate slate editor failed (custom beforeinput events, paste events).
             * Expect only one editor in DOM.
             */
            expect(isFocusedSpy).toHaveBeenCalled();
            const editor = isFocusedSpy.mock.calls[ 0 ][ 0 ];
            Transforms.select(editor, {
                anchor: { path: [ 0, 0, 0 ], offset: 0 },
                focus: { path: [ 0, 0, 0 ], offset: Node.string(editor.children[ 0 ]).length },
            });
            Transforms.insertText(editor, text);

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as this;
    }

}
