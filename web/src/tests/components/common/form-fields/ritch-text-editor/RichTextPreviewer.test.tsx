/**
 * @jest-environment jsdom-sixteen
 */

import React from 'react';
import { render } from '@testing-library/react';
import { RichTextPreviewer } from '../../../../../code/components/common/form-fields/ritch-text-editor/RichTextPreviewer';


describe('RichTextPreviewer component', () => {

    it('should render rich text in readonly mode', () => {
        const { container } = render(
            <RichTextPreviewer
                value={JSON.stringify([ {
                    children: [
                        { type: 'p', children: [ { text: 'Hello ' }, { bold: true, text: 'world' } ] },
                    ],
                } ])}
            />,
        );

        expect(container).toHaveTextContent('Hello world');
    });

});
