import React from 'react';
import * as SlateReact from 'slate-react';
import { pipe } from '@udecode/slate-plugins';
import { createEditor, Transforms } from 'slate';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { MarkButton, MarkType } from '../../../../../../code/components/common/form-fields/ritch-text-editor/toolbar-buttons/MarkButton';
import { withPlugins } from '../../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('MarkButton component', () => {

    const useSlateSpy = jest.spyOn(SlateReact, 'useSlate');

    beforeEach(() => {
        useSlateSpy.mockReset();
    });

    function verifyMark(mark: MarkType, buttonAriaLabel: string) {
        const editor = pipe(createEditor(), ...withPlugins);
        useSlateSpy.mockReturnValue(editor);
        editor.children = [ {
            children: [
                { type: 'p', children: [ { text: 'Hello world' } ] },
            ],
        } ];
        Transforms.select(editor, { // select 'world' word
            anchor: { path: [ 0, 0, 0 ], offset: 6 },
            focus: { path: [ 0, 0, 0 ], offset: 11 },
        });

        render(<MarkButton type={mark} />);
        const markButton = screen.getByRole('button', { name: buttonAriaLabel });

        userEvent.click(markButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: 'Hello ' }, { [ mark ]: true, text: 'world' } ] },
            ],
        } ]);

        userEvent.click(markButton);
        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: 'Hello world' } ] },
            ],
        } ]);
    }

    it('should toggle bold mark', () => {
        verifyMark('bold', 't:form.editor.toolbar.bold');
    });

    it('should toggle italic mark', () => {
        verifyMark('italic', 't:form.editor.toolbar.italic');
    });

    it('should toggle underline mark', () => {
        verifyMark('underline', 't:form.editor.toolbar.underline');
    });

    it('should toggle superscript mark', () => {
        verifyMark('superscript', 't:form.editor.toolbar.superscript');
    });

});
