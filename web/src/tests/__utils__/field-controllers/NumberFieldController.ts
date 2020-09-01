import { fireEvent } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { extendedUserEvent, flushPromises } from '../extendedUserEvent';


export class NumberFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): NumberFieldController {
        return this.resolve(inputElement) as NumberFieldController;
    }

    pasteAmount(value: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.paste(inputElement, value);
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as this;
    }

}
