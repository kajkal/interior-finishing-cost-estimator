import { AbstractFieldController } from './AbstractFieldController';
import { extendedUserEvent } from '../extendedUserEvent';


export class TextFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): TextFieldController {
        return this.resolve(inputElement) as TextFieldController;
    }

    type(value: string): TextFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.type(inputElement, value);
            return inputElement;
        }) as TextFieldController;
    }

    paste(value: string): TextFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.paste(inputElement, value);
            return inputElement;
        }) as TextFieldController;
    }

}
