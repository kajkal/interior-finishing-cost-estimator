import validator from 'validator';
import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';


export const IS_SLUG = 'isSlug';

function isSlug(value: unknown): boolean {
    return (typeof value === 'string') && validator.isSlug(value);
}

export function IsSlug(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: IS_SLUG,
            validator: {
                validate: (value): boolean => isSlug(value),
                defaultMessage: buildMessage(
                    (eachPrefix) => eachPrefix + '$property must be a valid slug',
                    validationOptions,
                ),
            },
        },
        validationOptions,
    );
}
