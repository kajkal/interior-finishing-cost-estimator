import 'reflect-metadata';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';
import { idTestValue } from '../../../../__utils__/validation-utils/test-data/idTestData';

import { ProjectUpdateFormData } from '../../../../../src/resolvers/project/input/ProjectUpdateFormData';


describe('ProjectUpdateFormData class', () => {

    function createProjectUpdateFormDataObject(data: Partial<ProjectUpdateFormData>): ProjectUpdateFormData {
        const validDefaultData: ProjectUpdateFormData = {
            projectId: '5f09e24646904045d48e5598',
            name: 'sample project name',
        };
        return Object.assign(new ProjectUpdateFormData(), validDefaultData, data);
    }

    describe('id field', () => {

        it('should accept valid projectId', () => {
            idTestValue('projectId').valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectUpdateFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid projectId', () => {
            idTestValue('projectId').invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectUpdateFormDataObject(data), expectedErrors);
            });
        });

    });

    describe('name field', () => {

        it('should accept valid name', () => {
            [
                { data: { name: 'valid name' }, expectedErrors: [] },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectUpdateFormDataObject(data), expectedErrors);
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
                expectValidationErrors(createProjectUpdateFormDataObject(data), expectedErrors);
            });
        });

    });

});
