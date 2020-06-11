import { changeInputValue } from './changeInputValue';


export interface InputValidatorConfig {
    inputElement: HTMLInputElement;
    errorMessageSelector: string;
}

export class InputValidator extends Promise<InputValidatorConfig> {

    static basedOn(inputElement: HTMLInputElement, errorMessageSelector: string): InputValidator {
        return this.resolve({ inputElement, errorMessageSelector }) as InputValidator;
    }

    expectError(value: string, expectedErrorMessage: string): InputValidator {
        return this.then(async (config: InputValidatorConfig) => {
            await changeInputValue(config.inputElement, value);
            const errorMessageElement = document.querySelector(config.errorMessageSelector);
            expect(errorMessageElement).not.toBeNull();
            expect(errorMessageElement).toHaveTextContent(expectedErrorMessage);
            return config;
        }) as InputValidator;
    }

    expectNoError(value: string): InputValidator {
        return this.then(async (config: InputValidatorConfig) => {
            await changeInputValue(config.inputElement, value);
            const errorMessageElement = document.querySelector(config.errorMessageSelector);
            expect(errorMessageElement).toBeNull();
            return config;
        }) as InputValidator;
    }

    /**
     * Validation could be finalized by either:
     * @example calling finish with jest done callback:
     * it('should ...', (done) => {
     *     InputValidator.for(...)
     *         .expectError(...)
     *         .finish(done);
     * });
     * @example or by awaiting:
     * it('should ...', async (done) => {
     *     await InputValidator.for(...)
     *         .expectError.(...);
     * });
     */
    async finish(doneCallback: jest.DoneCallback) {
        return this.then(() => doneCallback());
    }

}
