import { registerDecorator, ValidationOptions } from 'class-validator';


export const MockIsEmailAvailableValidator = {
    validate: jest.fn(),
    defaultMessage: jest.fn(),
};

jest.mock('../../../src/modules/user/validators/IsEmailAvailable', () => ({
    IsEmailAvailable: (validationOptions?: ValidationOptions) => (object: Object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            name: 'emailAvailability',
            async: true,
            options: validationOptions,
            validator: MockIsEmailAvailableValidator,
        });
    },
}));
