export abstract class AbstractFieldController extends Promise<HTMLElement> {

    expectError(expectedErrorMessage: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            expect(inputElement).toBeInvalid();
            expect(inputElement).toHaveDescription(expectedErrorMessage);
            return inputElement;
        }) as this;
    }

    expectNoError(expectedHelperText = ''): this {
        return this.then(async (inputElement: HTMLElement) => {
            expect(inputElement).toBeValid();
            expect(inputElement).toHaveDescription(expectedHelperText);
            return inputElement;
        }) as this;
    }

}
