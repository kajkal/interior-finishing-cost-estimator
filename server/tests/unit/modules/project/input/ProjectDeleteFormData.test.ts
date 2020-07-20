import 'reflect-metadata';
import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';
import { idTestValue } from '../../../../__utils__/validation-utils/test-data/idTestData';

import { ProjectDeleteFormData } from '../../../../../src/resolvers/project/input/ProjectDeleteFormData';


describe('ProjectDeleteFormData class', () => {

    function createProjectDeleteFormDataObject(data: Partial<ProjectDeleteFormData>): ProjectDeleteFormData {
        const validDefaultData: ProjectDeleteFormData = {
            projectId: '5f09e24646904045d48e5598',
        };
        return Object.assign(new ProjectDeleteFormData(), validDefaultData, data);
    }

    describe('id field', () => {

        it('should accept valid projectId', () => {
            idTestValue('projectId').valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectDeleteFormDataObject(data), expectedErrors);
            });
        });

        it('should reject invalid projectId', () => {
            idTestValue('projectId').invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createProjectDeleteFormDataObject(data), expectedErrors);
            });
        });

    });

});
