import React from 'react';
import * as SlateReact from 'slate-react';
import { pipe } from '@udecode/slate-plugins';
import { createEditor, Transforms } from 'slate';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { InsertImageButton } from '../../../../../../code/components/common/form-fields/ritch-text-editor/toolbar-buttons/InsertImageButton';
import { options, withPlugins } from '../../../../../../code/components/common/form-fields/ritch-text-editor/options';


describe('InsertImageButton component', () => {

    const useSlateSpy = jest.spyOn(SlateReact, 'useSlate');
    const promptSpy = jest.spyOn(window, 'prompt');

    beforeEach(() => {
        useSlateSpy.mockReset();
        promptSpy.mockReset();
    });

    function createSampleEditor() {
        const editor = pipe(createEditor(), ...withPlugins);
        useSlateSpy.mockReturnValue(editor);
        editor.children = [ {
            children: [
                { type: 'p', children: [ { text: 'Image: ' } ] },
            ],
        } ];
        Transforms.select(editor, { // 'Image: <selection/>'
            anchor: { path: [ 0, 0, 0 ], offset: 7 },
            focus: { path: [ 0, 0, 0 ], offset: 7 },
        });
        return editor;
    }

    class ViewUnderTest {
        static get insertImageButton() {
            return screen.getByRole('button', { name: 't:form.common.editor.toolbar.insertImage' });
        }
    }

    it('should insert image block on click', () => {
        const editor = createSampleEditor();

        render(<InsertImageButton options={options.image} />);

        promptSpy.mockReturnValue('http://example.com');
        userEvent.click(ViewUnderTest.insertImageButton);

        expect(editor.children).toEqual([ {
            children: [
                { type: 'p', children: [ { text: 'Image: ' } ] },
                { type: 'img', url: 'http://example.com', children: [ { text: '' } ] },
                { type: 'p', children: [ { text: '' } ] },
            ],
        } ]);
    });

});
