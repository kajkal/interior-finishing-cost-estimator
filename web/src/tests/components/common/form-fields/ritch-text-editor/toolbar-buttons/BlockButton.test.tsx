import React from 'react';
import { createEditor } from 'slate';
import * as SlateReact from 'slate-react';
import { pipe } from '@udecode/slate-plugins';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { BlockButton } from '../../../../../../code/components/common/form-fields/ritch-text-editor/toolbar-buttons/BlockButton';
import { options, withPlugins } from '../../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('BlockButton component', () => {

    const useSlateSpy = jest.spyOn(SlateReact, 'useSlate');

    beforeEach(() => {
        useSlateSpy.mockReset();
    });

    function createSampleEditor() {
        const editor = pipe(createEditor(), ...withPlugins);
        useSlateSpy.mockReturnValue(editor);
        editor.insertNode({
            children: [
                { type: 'p', children: [ { text: '' } ] },
            ],
        });
        return editor;
    }

    class ViewUnderTest {
        static get titleButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.title' });
        }
        static get subtitleButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.subtitle' });
        }
        static get bulletedListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.bulletedList' });
        }
        static get numberedListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.numberedList' });
        }
        static get todoListButton() {
            return screen.getByRole('button', { name: 't:form.editor.toolbar.todoList' });
        }
    }

    it('should toggle title block on click', () => {
        const editor = createSampleEditor();
        render(<BlockButton type='title' />);

        userEvent.click(ViewUnderTest.titleButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'h1', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);

        userEvent.click(ViewUnderTest.titleButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

    it('should toggle to subtitle block on click', () => {
        const editor = createSampleEditor();
        render(<BlockButton type='subtitle' />);

        userEvent.click(ViewUnderTest.subtitleButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'h2', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);

        userEvent.click(ViewUnderTest.subtitleButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

    it('should toggle to todo block on click', () => {
        const editor = createSampleEditor();
        render(<BlockButton type='todo' />);

        userEvent.click(ViewUnderTest.todoListButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'action_item', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);

        userEvent.click(ViewUnderTest.todoListButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

    it('should toggle to bulleted list block on click', () => {
        const editor = createSampleEditor();
        render(<BlockButton type='bulleted' options={options.list} />);

        userEvent.click(ViewUnderTest.bulletedListButton);
        expect(editor.children).toEqual([ {
            children: [
                {
                    type: 'ul',
                    children: [
                        { type: 'li', children: [ { children: [ { text: '' } ], type: 'p' } ] },
                    ],
                },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);

        userEvent.click(ViewUnderTest.bulletedListButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

    it('should toggle to numbered list block on click', () => {
        const editor = createSampleEditor();
        render(<BlockButton type='numbered' options={options.list} />);

        userEvent.click(ViewUnderTest.numberedListButton);
        expect(editor.children).toEqual([ {
            children: [
                {
                    type: 'ol',
                    children: [
                        { type: 'li', children: [ { children: [ { text: '' } ], type: 'p' } ] },
                    ],
                },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);

        userEvent.click(ViewUnderTest.numberedListButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

});
