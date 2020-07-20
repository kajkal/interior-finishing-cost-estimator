import 'reflect-metadata';
import { ElementId } from '../../../../../src/resolvers/common/input/ElementId';

import { expectValidationErrors } from '../../../../__utils__/validation-utils/validationUtils';
import { idTestValue } from '../../../../__utils__/validation-utils/test-data/idTestData';


describe('ElementId class', () => {

    function createElementIdObject(data: Partial<ElementId>): ElementId {
        const validDefaultData: ElementId = {
            id: '5f0ace7775a3fa150c66eae9',
        };
        return Object.assign(new ElementId(), validDefaultData, data);
    }

    describe('id field', () => {

        it('should accept valid id', () => {
            idTestValue('id').valid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createElementIdObject(data), expectedErrors);
            });
        });

        it('should reject invalid id', () => {
            idTestValue('id').invalid.forEach(({ data, expectedErrors }) => {
                expectValidationErrors(createElementIdObject(data), expectedErrors);
            });
        });

    });

});
