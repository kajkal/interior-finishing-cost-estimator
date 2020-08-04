import React from 'react';
import * as SlateReact from 'slate-react';
import { pipe } from '@udecode/slate-plugins';
import { createEditor, Transforms } from 'slate';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { InsertLinkButton } from '../../../../../../code/components/common/form-fields/ritch-text-editor/toolbar-buttons/InsertLinkButton';
import { options, withPlugins } from '../../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('InsertLinkButton component', () => {

    const useSlateSpy = jest.spyOn(SlateReact, 'useSlate');
    const promptSpy = jest.spyOn(window, 'prompt');

    beforeEach(() => {
        useSlateSpy.mockReset();
        promptSpy.mockReset();
    });

    function createSampleEditor(initialText: string, selectedRange: [ number, number ]) {
        const editor = pipe(createEditor(), ...withPlugins);
        useSlateSpy.mockReturnValue(editor);
        editor.children = [ {
            children: [
                { type: 'p', children: [ { text: initialText } ] },
            ],
        } ];
        const [ from, to ] = selectedRange;
        Transforms.select(editor, {
            anchor: { path: [ 0, 0, 0 ], offset: from },
            focus: { path: [ 0, 0, 0 ], offset: to },
        });
        return editor;
    }

    class ViewUnderTest {
        static get insertLinkButton() {
            return screen.getByRole('button', { name: 't:form.common.editor.toolbar.insertLink' });
        }
    }

    /**
     * initial: 'Link: <selection/>'
     * expected: 'Link: <a href='http://example.com'>http://example.com</a>'
     */
    it('should insert inline link on click', () => {
        const editor = createSampleEditor('Link: ', [ 6, 6 ]);
        render(<InsertLinkButton options={options.link} />);

        promptSpy.mockReturnValue('http://example.com');
        userEvent.click(ViewUnderTest.insertLinkButton);

        expect(editor.children).toEqual([ {
            children: [
                {
                    type: 'p',
                    children: [
                        { text: 'Link: ' },
                        { type: 'a', url: 'http://example.com', children: [ { text: 'http://example.com' } ] },
                        { text: '' },
                    ],
                },
            ],
        } ]);
    });

    /**
     * initial: 'Hello <selection>world</selection>'
     * expected: 'Hello <a href='http://example.com'>world</a>'
     */
    it('should create link with selected text label on click', () => {
        const editor = createSampleEditor('Hello world', [ 6, 11 ]);
        render(<InsertLinkButton options={options.link} />);

        promptSpy.mockReturnValue('http://example.com');
        userEvent.click(ViewUnderTest.insertLinkButton);

        expect(editor.children).toEqual([ {
            children: [
                {
                    type: 'p',
                    children: [
                        { text: 'Hello ' },
                        { type: 'a', url: 'http://example.com', children: [ { text: 'world' } ] },
                        { text: '' },
                    ],
                },
            ],
        } ]);
    });

});
