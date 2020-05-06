import { Container } from 'typedi';

import { GraphQLLoggerMockManager } from '../../../__mocks__/utils/LoggerMockManager';
import { MockProductRepository } from '../../../__mocks__/repositories/MockProductRepository';

import { ProductRepository } from '../../../../src/repositories/ProductRepository';


describe('ProductResolver class ', () => {

    beforeAll(() => {
        Container.set(ProductRepository, MockProductRepository);
    });

    beforeEach(() => {
        GraphQLLoggerMockManager.setupMocks();
        MockProductRepository.setupMocks();
    });

    it.todo('pass');

});
