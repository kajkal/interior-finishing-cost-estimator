import { fireEvent } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { extendedUserEvent } from '../extendedUserEvent';


export class SurfaceAreaFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): SurfaceAreaFieldController {
        return this.resolve(inputElement) as SurfaceAreaFieldController;
    }

    pasteAmount(value: string): SurfaceAreaFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.paste(inputElement, value);
            fireEvent.blur(inputElement);
            return inputElement;
        }) as SurfaceAreaFieldController;
    }

}
