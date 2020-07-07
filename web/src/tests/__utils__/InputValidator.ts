import { extendedUserEvent } from './extendedUserEvent';


/**
 * Test helper class used to verify input fields validation.
 */
export class InputValidator extends Promise<HTMLElement> {

    static basedOn(inputElement: HTMLElement): InputValidator {
        return this.resolve(inputElement) as InputValidator;
    }

    expectError(value: string, expectedErrorMessage: string): InputValidator {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.type(inputElement, value);

            expect(inputElement).toBeInvalid();
            expect(inputElement).toHaveDescription(expectedErrorMessage);

            return inputElement;
        }) as InputValidator;
    }

    expectNoError(value: string): InputValidator {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.type(inputElement, value);

            expect(inputElement).toBeValid();
            expect(inputElement).not.toHaveDescription();

            return inputElement;
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
