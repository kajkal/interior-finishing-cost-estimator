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

    expectNoError(value: string, helperText?: string): InputValidator {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.type(inputElement, value);

            expect(inputElement).toBeValid();
            if (helperText) {
                expect(inputElement).toHaveDescription(helperText);
            } else {
                expect(inputElement).not.toHaveDescription();
            }

            return inputElement;
        }) as InputValidator;
    }

}
