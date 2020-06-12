import 'reflect-metadata';
import { validateSync, ValidationError } from 'class-validator';


export function expectValidationErrors(objectToValidate: object, expectedErrors: ValidationError['constraints'][]) {
    const validationErrors = validateSync(objectToValidate);
    expect(validationErrors).toMatchObject(expectedErrors.map(c => ({ constraints: c })));
}
