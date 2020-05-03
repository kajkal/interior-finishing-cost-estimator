import { registerDecorator, ValidationOptions } from 'class-validator';
import { User } from '../../../entities/User';


/**
 * Checks if email is available - returns false if email is already taken.
 */
export function IsEmailAvailable(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            name: 'emailAvailability',
            async: true,
            options: validationOptions,
            validator: {
                validate(email: string): Promise<boolean> {
                    return User.findOne({ email }).then((user) => !user);
                },
                defaultMessage(): string {
                    return 'EMAIL_NOT_AVAILABLE';
                },
            },
        });
    };
}
