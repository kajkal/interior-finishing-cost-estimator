import 'reflect-metadata';

import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';

import { ProjectCreateFormData } from '../../../../../src/resolvers/project/input/ProjectCreateFormData';


describe('ProjectCreateFormData class', () => {

    function createProjectCreateFormDataObject(data: Partial<ProjectCreateFormData>): ProjectCreateFormData {
        const validDefaultData: ProjectCreateFormData = {
            name: 'sample project name',
        };
        return Object.assign(new ProjectCreateFormData(), validDefaultData, data);
    }

    describe('name field', () => {

        it('should accept valid name', () => {
            [
                { data: { name: 'valid name' }, expectedErrors: [] },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectCreateFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid name', () => {
            [
                {
                    data: { name: 'a' },
                    expectedErrors: [ {
                        length: expect.stringMatching(/name must be longer than or equal to \d+ characters/),
                    } ],
                },
                {
                    data: { name: 'a'.repeat(100) },
                    expectedErrors: [ {
                        length: expect.stringMatching(/name must be shorter than or equal to \d+ characters/),
                    } ],
                },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectCreateFormDataObject(data), expectedErrors);
            });
        });

    });

});
