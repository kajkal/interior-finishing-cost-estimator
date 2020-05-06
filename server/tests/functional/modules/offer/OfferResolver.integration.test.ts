import { Container } from 'typedi';

import { GraphQLLoggerMockManager } from '../../../__mocks__/utils/LoggerMockManager';
import { MockOfferRepository } from '../../../__mocks__/repositories/MockOfferRepository';

import { OfferRepository } from '../../../../src/repositories/OfferRepository';


describe('OfferResolver class ', () => {

    beforeAll(() => {
        Container.set(OfferRepository, MockOfferRepository);
    });

    beforeEach(() => {
        GraphQLLoggerMockManager.setupMocks();
        MockOfferRepository.setupMocks();
    });

    it.todo('pass');

});
