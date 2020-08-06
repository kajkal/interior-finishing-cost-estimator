import { Request, Response } from 'supertest';

import { MockLogger } from '../../__mocks__/utils/logger';

import { IntegrationTestUtils } from './useIntegrationTestsUtils';
import { getAuthHeader } from './authUtils';


interface ValidationValidatorProps {
    request: Request;
    response?: Response;
}

export class ValidationValidator extends Promise<ValidationValidatorProps> {

    static processRequest(request: Request): ValidationValidator {
        return this.resolve({ request }) as ValidationValidator;
    }

    expectValidationError(onProperty?: string) {
        return this.then(async ({ request }) => {
            const response = await request;

            // verify operation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'Argument Validation Error',
                        extensions: expect.objectContaining({
                            exception: expect.objectContaining({
                                validationErrors: expect.arrayContaining([
                                    expect.objectContaining({
                                        property: onProperty,
                                    }),
                                ]),
                            }),
                        }),
                    }),
                ],
            });

            return { request, response };
        });
    }

    expectValidationSuccess() {
        return this.then(async ({ request }) => {
            const response = await request;

            // verify operation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'MOCKED RESOLVER BODY',
                    }),
                ],
            });

            return { request, response };
        });
    }

    expectNotAuthorizedError() {
        return this.then(async ({ request }) => {
            const response = await request;

            // verify if access was logged
            expect(MockLogger.warn).toHaveBeenCalledTimes(1);
            expect(MockLogger.warn).toHaveBeenCalledWith(expect.objectContaining({ message: 'invalid token' }));

            // verify operation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'INVALID_ACCESS_TOKEN',
                    }),
                ],
            });

            return { request, response };
        });
    }

}


export interface ValidationUtils<FormData> {
    withoutAuth: (data?: Partial<FormData>) => ValidationValidator;
    withAuth: (data?: Partial<FormData>) => ValidationValidator;
}

export function useValidationUtils<FormData>(options: {
    testUtils: IntegrationTestUtils;
    resolverSpy: jest.SpiedFunction<(...args: any[]) => any>;
    query: string;
    validFormData: FormData;
}) {
    const validationUtils: ValidationUtils<FormData> = {
        withoutAuth: null!,
        withAuth: null!,
    };

    beforeAll(async () => {
        options.resolverSpy.mockImplementation(() => {
            throw new Error('MOCKED RESOLVER BODY');
        });

        const user = await options.testUtils.db.populateWithUser();
        validationUtils.withoutAuth = (data?: Partial<FormData>) => (
            ValidationValidator.processRequest(
                options.testUtils.postGraphQL({
                    query: options.query,
                    variables: { ...options.validFormData, ...data },
                }),
            )
        );
        validationUtils.withAuth = (data?: Partial<FormData>) => (
            ValidationValidator.processRequest(
                options.testUtils.postGraphQL({
                    query: options.query,
                    variables: { ...options.validFormData, ...data },
                }).set('Authorization', getAuthHeader(user)),
            )
        );
    });
    afterAll(() => {
        options.resolverSpy.mockRestore();
    });

    return validationUtils;
}
