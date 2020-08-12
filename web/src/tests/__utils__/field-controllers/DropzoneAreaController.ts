import userEvent from '@testing-library/user-event';
import { getByText } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { extendedUserEvent } from '../extendedUserEvent';


export class DropzoneAreaController extends AbstractFieldController {

    static from(inputElement: HTMLElement): DropzoneAreaController {
        return this.resolve(inputElement) as DropzoneAreaController;
    }

    private static getFileChip(inputElement: HTMLElement, filename: string) {
        const fileChip = getByText(inputElement.parentElement!, filename).parentElement!;
        expect(fileChip).toHaveAttribute('role', 'button');
        return fileChip;
    }

    dropFiles(files: File[] | undefined | null): DropzoneAreaController {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.drop(inputElement, files || []);
            return inputElement;
        }) as DropzoneAreaController;
    }

    removeFile(filename: string): DropzoneAreaController {
        return this.then(async (inputElement: HTMLElement) => {
            const fileChip = DropzoneAreaController.getFileChip(inputElement, filename);
            userEvent.click(fileChip.querySelector('svg')!);
            return inputElement;
        }) as DropzoneAreaController;
    }

}
