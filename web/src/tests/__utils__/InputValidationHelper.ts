import { changeInputValue } from './changeInputValue';


export class InputValidationHelper {

    constructor(
        private inputElement: HTMLInputElement,
        private errorMessageSelector: string,
    ) {
    }

    async expectError(value: string, expectedErrorMessage: string) {
        await changeInputValue(this.inputElement, value);
        const errorMessageElement = document.querySelector(this.errorMessageSelector);
        expect(errorMessageElement).toBeInTheDocument();
        expect(errorMessageElement).toHaveTextContent(expectedErrorMessage);
    }

    async expectNoError(value: string) {
        await changeInputValue(this.inputElement, value);
        const errorMessageElement = document.querySelector(this.errorMessageSelector);
        expect(errorMessageElement).toBe(null);
    }

}
