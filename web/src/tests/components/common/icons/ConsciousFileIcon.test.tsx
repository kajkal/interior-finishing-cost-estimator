import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConsciousFileIcon } from '../../../../code/components/common/icons/ConsciousFileIcon';


describe('ConsciousFileIcon component', () => {

    const testFilenames = {
        pdf: [
            'file.pdf',
        ],
        zip: [
            'file.zip',
        ],
        rar: [
            'file.rar',
        ],
        tar: [
            'file.tar',
        ],
        xls: [
            'file.xls',
            'file.xlsx',
            'file.ods',
        ],
        doc: [
            'file.doc',
            'file.docx',
            'file.odt',
        ],
        txt: [
            'file.txt',
        ],
        image: [
            'file.jpg',
            'file.png',
            'file.bmp',
            'file.webp',
        ],
        audio: [
            'file.mp3',
            'file.wma',
        ],
        other: [
            '.file',
            'no-extension',
        ],
    };

    it('should render icon corresponding to the file extension', () => {
        expect.assertions(19);
        const { rerender } = render(<ConsciousFileIcon filename='init' />);
        Object.entries(testFilenames).forEach(([ type, filenames ]) => {
            filenames.forEach((filename) => {
                rerender(<ConsciousFileIcon filename={filename} />);
                expect(screen.getByTestId(type)).toBeVisible();
            });
        });
    });

});
