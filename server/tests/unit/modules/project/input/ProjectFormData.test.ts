import 'reflect-metadata';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';
import { idTestValue } from '../../../../__utils__/validation-utils/test-data/idTestData';

import { ProjectFormData } from '../../../../../src/resolvers/project/input/ProjectFormData';


describe('ProjectFormData class', () => {

    function createProjectFormDataObject(data: Partial<ProjectFormData>): ProjectFormData {
        const validDefaultData: ProjectFormData = {
            id: undefined,
            name: 'sample project name',
        };
        return Object.assign(new ProjectFormData(), validDefaultData, data);
    }

    describe('id field', () => {

        it('should accept valid id', () => {
            idTestValue.valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid id', () => {
            idTestValue.invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectFormDataObject(data), expectedErrors);
            });
        });

        it('should be optional', () => {
            [
                { data: { id: undefined }, expectedErrors: [] },
                { data: { id: null }, expectedErrors: [] },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectFormDataObject(data as Partial<ProjectFormData>), expectedErrors);
            });
        });

    });

    describe('name field', () => {

        it('should accept valid name', () => {
            [
                { data: { name: 'valid name' }, expectedErrors: [] },
            ].forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectFormDataObject(data), expectedErrors);
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
                expectValidationErrors(createProjectFormDataObject(data), expectedErrors);
            });
        });

    });

});
