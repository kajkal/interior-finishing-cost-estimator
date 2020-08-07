import { fireEvent } from '@testing-library/react';

import { AbstractFieldController } from './AbstractFieldController';
import { flushPromises } from '../extendedUserEvent';
import slateEvent from '../slateEvent';


export class EditorFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): EditorFieldController {
        return this.resolve(inputElement) as EditorFieldController;
    }

    typeInEditor(text: string): EditorFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            fireEvent.focus(inputElement);
            slateEvent.typeInEditor(text);
            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as EditorFieldController;
    }

}
