import 'reflect-metadata';
import { FileUpload } from 'graphql-upload';
import { ResourceFormData } from '../../../../../src/resolvers/common/input/ResourceFormData';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';


describe('ResourceFormData class', () => {

    function createResourceFormDataObject(data: Partial<ResourceFormData>): ResourceFormData {
        const validDefaultData: ResourceFormData = {
            file: {} as FileUpload,
            description: 'sample file description',
        };
        return Object.assign(new ResourceFormData(), validDefaultData, data);
    }

    describe('file field', () => {

        it('should accept valid file', () => {
            expectValidationErrors(createResourceFormDataObject({
                file: {} as FileUpload,
            }), []);
        });

        it('should reject missing file', () => {
            expectValidationErrors(createResourceFormDataObject({
                file: undefined,
            }), [ {
                isNotEmpty: 'file should not be empty',
            } ]);
        });

    });

    describe('description filed', () => {

        it('should accept valid description', () => {
            [
                { data: { description: 'valid description' }, expectedErrors: [] },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createResourceFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid description', () => {
            [
                {
                    data: { description: '' },
                    expectedErrors: [ {
                        length: expect.stringMatching(/description must be longer than or equal to \d+ characters/),
                    } ],
                },
                {
                    data: { description: 'a'.repeat(256) },
                    expectedErrors: [ {
                        length: expect.stringMatching(/description must be shorter than or equal to \d+ characters/),
                    } ],
                },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createResourceFormDataObject(data), expectedErrors);
            });
        });

    });

});
