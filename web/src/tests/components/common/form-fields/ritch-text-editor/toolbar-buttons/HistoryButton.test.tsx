import React from 'react';
import * as SlateReact from 'slate-react';
import { pipe } from '@udecode/slate-plugins';
import { createEditor, Operation } from 'slate';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { HistoryButton } from '../../../../../../code/components/common/form-fields/ritch-text-editor/toolbar-buttons/HistoryButton';
import { withPlugins } from '../../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('HistoryButton component', () => {

    const useSlateSpy = jest.spyOn(SlateReact, 'useSlate');

    beforeEach(() => {
        useSlateSpy.mockReset();
    });

    const selectionOperationHistoryEntry: Operation = {
        type: 'set_selection',
        properties: null,
        newProperties: { anchor: { path: [ 0, 0, 0 ], offset: 5 }, focus: { path: [ 0, 0, 0 ], offset: 5 } },
    };

    const insertTextOperationHistoryEntry: Operation = {
        type: 'insert_text',
        path: [ 0, 0, 0 ],
        offset: 5,
        text: ' world',
    };

    function createSampleEditor() {
        const editor = pipe(createEditor(), ...withPlugins);
        useSlateSpy.mockReturnValue(editor);
        editor.insertNode({
            children: [
                { type: 'p', children: [ { text: 'Hello' } ] },
            ],
        });
        editor.history.undos.length = 0;
        editor.history.redos.length = 0;
        return editor;
    }

    class ViewUnderTest {
        static get undoButton() {
            return screen.getByRole('button', { name: 't:form.common.editor.toolbar.undo' });
        }
        static get redoButton() {
            return screen.getByRole('button', { name: 't:form.common.editor.toolbar.redo' });
        }
    }

    describe('undo button', () => {

        it('should be disabled when there is no undos in history', () => {
            const editor = createSampleEditor();
            const { rerender } = render(<HistoryButton type='undo' />);

            // when there is no 'undos' entries in history
            expect(ViewUnderTest.undoButton).toBeDisabled();

            // when 'undos' are only about selection
            editor.apply(selectionOperationHistoryEntry);
            rerender(<HistoryButton type='undo' />);
            expect(ViewUnderTest.undoButton).toBeDisabled();

            // when 'undos' are not only about selection
            editor.apply(insertTextOperationHistoryEntry);
            rerender(<HistoryButton type='undo' />);
            expect(ViewUnderTest.undoButton).not.toBeDisabled();
        });

        it('should undo last operation on click', () => {
            const editor = createSampleEditor();
            editor.insertText(' world');
            render(<HistoryButton type='undo' />);

            // verify initial editor state
            expect(editor.children).toEqual([ {
                children: [ { type: 'p', children: [ { text: 'Hello world' } ] } ],
            } ]);

            userEvent.click(ViewUnderTest.undoButton);

            // verify new editor state
            expect(editor.children).toEqual([ {
                children: [ { type: 'p', children: [ { text: 'Hello' } ] } ],
            } ]);
        });

    });

    describe('redo button', () => {

        it('should be disabled when there is no redos in history', () => {
            const editor = createSampleEditor();
            const { rerender } = render(<HistoryButton type='redo' />);

            // when there is no 'redos' entries in history
            expect(ViewUnderTest.redoButton).toBeDisabled();

            // when 'redos' are only about selection
            editor.history.redos.push([ selectionOperationHistoryEntry ]);
            rerender(<HistoryButton type='redo' />);
            expect(ViewUnderTest.redoButton).toBeDisabled();

            // when 'redos' are not only about selection
            editor.history.redos.push([ insertTextOperationHistoryEntry ]);
            rerender(<HistoryButton type='redo' />);
            expect(ViewUnderTest.redoButton).not.toBeDisabled();
        });

        it('should redo next operation on click', () => {
            const editor = createSampleEditor();
            editor.insertText(' world');
            editor.undo();
            render(<HistoryButton type='redo' />);

            // verify initial editor state
            expect(editor.children).toEqual([ {
                children: [ { type: 'p', children: [ { text: 'Hello' } ] } ],
            } ]);

            userEvent.click(ViewUnderTest.redoButton);

            // verify new editor state
            expect(editor.children).toEqual([ {
                children: [ { type: 'p', children: [ { text: 'Hello world' } ] } ],
            } ]);
        });

    });

});
